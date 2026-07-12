import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.core.uuid import uuid7

from app.core.exceptions import NotFoundError, ConflictError, ForbiddenError
from app.models.audit import AuditCycle, AuditItem, audit_cycle_auditors
from app.models.asset import Asset
from app.models.user import User
from app.models.enums import AuditCycleStatus, AuditItemStatus, AssetStatus, MaintenanceStatus, MaintenancePriority
from app.models.maintenance import MaintenanceRequest
from app.repositories.audit import AuditCycleRepository, AuditItemRepository
from app.repositories.asset import AssetRepository
from app.repositories.user import UserRepository
from app.repositories.org import DepartmentRepository
from app.schemas.audit import AuditCycleCreate, AuditItemUpdate
from app.services.utils import log_activity, create_notification

class AuditService:
    @staticmethod
    async def create_cycle(
        db: AsyncSession, org_id: uuid.UUID, req: AuditCycleCreate, actor_id: uuid.UUID
    ) -> AuditCycle:
        dept_repo = DepartmentRepository(db)
        user_repo = UserRepository(db)
        asset_repo = AssetRepository(db)

        # 1. Validate department if provided
        if req.scope_department_id:
            dept = await dept_repo.get_by_id_and_org(req.scope_department_id, org_id)
            if not dept:
                raise NotFoundError("Scope department not found.")

        # 2. Validate auditors exist and belong to org
        auditors = []
        for auditor_id in req.auditor_ids:
            auditor = await user_repo.get_by_id_and_org(auditor_id, org_id)
            if not auditor:
                raise NotFoundError(f"Auditor user with ID {auditor_id} not found.")
            if auditor.status != "active":
                raise ConflictError(f"Auditor user with ID {auditor_id} is inactive.")
            auditors.append(auditor)

        # 3. Create Audit Cycle
        cycle = AuditCycle(
            id=uuid7(),
            org_id=org_id,
            scope_department_id=req.scope_department_id,
            scope_location=req.scope_location,
            date_range_start=req.date_range_start,
            date_range_end=req.date_range_end,
            status=AuditCycleStatus.draft,
            created_by_id=actor_id,
            auditors=auditors
        )
        db.add(cycle)
        await db.flush()

        # 4. Determine assets in scope
        stmt = select(Asset).where(
            Asset.org_id == org_id,
            Asset.status.notin_([AssetStatus.retired, AssetStatus.disposed])
        )

        if req.scope_department_id:
            # Filter assets held by department OR held by user belonging to department
            stmt = stmt.join(User, Asset.current_holder_id == User.id, isouter=True).where(
                or_(
                    (Asset.current_holder_type == "department") & (Asset.current_holder_id == req.scope_department_id),
                    (Asset.current_holder_type == "employee") & (User.department_id == req.scope_department_id)
                )
            )

        if req.scope_location:
            stmt = stmt.where(Asset.location.ilike(f"%{req.scope_location}%"))

        result = await db.execute(stmt)
        assets = result.scalars().all()

        # 5. Create AuditItems for each in-scope asset
        for asset in assets:
            item = AuditItem(
                id=uuid7(),
                audit_cycle_id=cycle.id,
                asset_id=asset.id,
                status=AuditItemStatus.pending
            )
            db.add(item)

        await db.flush()
        await log_activity(db, org_id, actor_id, "create_audit_cycle", "audit_cycle", cycle.id)
        return cycle

    @staticmethod
    async def start_cycle(
        db: AsyncSession, org_id: uuid.UUID, cycle_id: uuid.UUID, actor_id: uuid.UUID
    ) -> AuditCycle:
        cycle_repo = AuditCycleRepository(db)
        cycle = await cycle_repo.get_by_id_and_org(cycle_id, org_id)
        if not cycle:
            raise NotFoundError("Audit cycle not found.")
        if cycle.status != AuditCycleStatus.draft:
            raise ConflictError("Only draft cycles can be started.")

        cycle.status = AuditCycleStatus.in_progress
        await db.flush()

        # Notify auditors
        for auditor in cycle.auditors:
            await create_notification(
                db,
                org_id=org_id,
                user_id=auditor.id,
                type_="audit_assigned",
                message=f"You have been assigned to audit cycle from {cycle.date_range_start} to {cycle.date_range_end}.",
                related_type="audit_cycle",
                related_id=cycle.id
            )

        await log_activity(db, org_id, actor_id, "start_audit_cycle", "audit_cycle", cycle.id)
        return cycle

    @staticmethod
    async def verify_item(
        db: AsyncSession, org_id: uuid.UUID, cycle_id: uuid.UUID, item_id: uuid.UUID, req: AuditItemUpdate, actor_id: uuid.UUID
    ) -> AuditItem:
        cycle_repo = AuditCycleRepository(db)
        item_repo = AuditItemRepository(db)

        cycle = await cycle_repo.get_by_id_and_org(cycle_id, org_id)
        if not cycle:
            raise NotFoundError("Audit cycle not found.")
        if cycle.status != AuditCycleStatus.in_progress:
            raise ConflictError("Cannot verify items unless the audit cycle is in progress.")

        # Check authorization (actor must be auditor or admin)
        user_repo = UserRepository(db)
        actor = await user_repo.get(actor_id)
        is_auditor = any(aud.id == actor_id for aud in cycle.auditors)
        if not is_auditor and actor.role.value != "admin":
            raise ForbiddenError("You are not authorized to verify items in this audit cycle.")

        item = await item_repo.get_by_id_and_cycle(item_id, cycle_id)
        if not item:
            raise NotFoundError("Audit item not found.")

        item.status = req.status
        item.notes = req.notes
        item.verified_by_id = actor_id
        item.verified_at = datetime.now(timezone.utc)
        await db.flush()

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="verify_audit_item",
            entity_type="audit_item",
            entity_id=item.id,
            metadata={"status": req.status.value}
        )

        return item

    @staticmethod
    async def close_cycle(
        db: AsyncSession, org_id: uuid.UUID, cycle_id: uuid.UUID, actor_id: uuid.UUID
    ) -> AuditCycle:
        cycle_repo = AuditCycleRepository(db)
        asset_repo = AssetRepository(db)
        item_repo = AuditItemRepository(db)

        cycle = await cycle_repo.get_by_id_and_org(cycle_id, org_id)
        if not cycle:
            raise NotFoundError("Audit cycle not found.")
        if cycle.status != AuditCycleStatus.in_progress:
            raise ConflictError("Only in-progress audit cycles can be closed.")

        # Set status to closed irreversibly
        cycle.status = AuditCycleStatus.closed
        cycle.closed_at = datetime.now(timezone.utc)
        
        # Load all audit items in this cycle
        stmt = select(AuditItem).where(AuditItem.audit_cycle_id == cycle.id)
        items = (await db.execute(stmt)).scalars().all()

        for item in items:
            asset = await asset_repo.get_by_id_and_org(item.asset_id, org_id, lock=True)
            if not asset:
                continue

            if item.status == AuditItemStatus.missing:
                # Flip confirmed-missing assets to lost
                asset.status = AssetStatus.lost
                await log_activity(
                    db, org_id, actor_id, "auto_mark_lost_audit", "asset", asset.id, {"audit_cycle_id": str(cycle.id)}
                )

            elif item.status == AuditItemStatus.damaged:
                # Flip confirmed-damaged to under_maintenance and create MaintenanceRequest
                asset.status = AssetStatus.under_maintenance
                
                # Auto-create pending MaintenanceRequest
                maint_req = MaintenanceRequest(
                    id=uuid7(),
                    org_id=org_id,
                    asset_id=asset.id,
                    raised_by_id=item.verified_by_id or actor_id,
                    issue_description=f"Auto-created from audit cycle closure: {item.notes or 'Damaged during audit'}",
                    priority=MaintenancePriority.high,
                    status=MaintenanceStatus.pending,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(maint_req)
                
                await log_activity(
                    db,
                    org_id=org_id,
                    actor_id=actor_id,
                    action="auto_mark_damaged_audit",
                    entity_type="asset",
                    entity_id=asset.id,
                    metadata={"audit_cycle_id": str(cycle.id), "maintenance_request_id": str(maint_req.id)}
                )

        await db.flush()
        await log_activity(db, org_id, actor_id, "close_audit_cycle", "audit_cycle", cycle.id)
        return cycle
