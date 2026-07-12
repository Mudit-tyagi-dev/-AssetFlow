import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.uuid import uuid7

from app.core.exceptions import NotFoundError, ConflictError
from app.models.maintenance import MaintenanceRequest
from app.models.enums import AssetStatus, MaintenanceStatus, MaintenancePriority
from app.repositories.asset import AssetRepository
from app.repositories.maintenance import MaintenanceRequestRepository
from app.schemas.maintenance import MaintenanceRequestCreate, MaintenanceRequestUpdate
from app.services.asset_service import AssetService
from app.services.utils import log_activity, create_notification

class MaintenanceService:
    @staticmethod
    async def raise_request(
        db: AsyncSession, org_id: uuid.UUID, req: MaintenanceRequestCreate, actor_id: uuid.UUID
    ) -> MaintenanceRequest:
        asset_repo = AssetRepository(db)
        
        # Verify asset exists
        asset = await asset_repo.get_by_id_and_org(req.asset_id, org_id)
        if not asset:
            raise NotFoundError("Asset not found.")
            
        if asset.status in (AssetStatus.retired, AssetStatus.disposed):
            raise ConflictError("Cannot raise maintenance for retired or disposed assets.")

        # Create request in pending state (no asset status change yet)
        maint_req = MaintenanceRequest(
            id=uuid7(),
            org_id=org_id,
            asset_id=req.asset_id,
            raised_by_id=actor_id,
            issue_description=req.issue_description,
            priority=req.priority or MaintenancePriority.medium,
            photo_url=req.photo_url,
            status=MaintenanceStatus.pending,
            created_at=datetime.now(timezone.utc)
        )
        db.add(maint_req)
        await db.flush()

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="raise_maintenance_request",
            entity_type="maintenance_request",
            entity_id=maint_req.id
        )

        return maint_req

    @staticmethod
    async def approve_request(
        db: AsyncSession, org_id: uuid.UUID, request_id: uuid.UUID, actor_id: uuid.UUID
    ) -> MaintenanceRequest:
        maint_repo = MaintenanceRequestRepository(db)
        asset_repo = AssetRepository(db)

        maint_req = await maint_repo.get_by_id_and_org(request_id, org_id)
        if not maint_req:
            raise NotFoundError("Maintenance request not found.")
        if maint_req.status != MaintenanceStatus.pending:
            raise ConflictError("Only pending maintenance requests can be approved.")

        # Lock the asset row
        asset = await asset_repo.get_by_id_and_org(maint_req.asset_id, org_id, lock=True)
        if not asset:
            raise NotFoundError("Asset not found.")

        # Validate and transition asset status
        AssetService.validate_transition(asset.status, AssetStatus.under_maintenance)
        asset.status = AssetStatus.under_maintenance
        
        maint_req.status = MaintenanceStatus.approved
        maint_req.approved_by_id = actor_id
        await db.flush()

        # Notify requester
        await create_notification(
            db,
            org_id=org_id,
            user_id=maint_req.raised_by_id,
            type_="maintenance_approved",
            message=f"Maintenance request for asset '{asset.name}' has been approved.",
            related_type="maintenance_request",
            related_id=maint_req.id
        )

        await log_activity(db, org_id, actor_id, "approve_maintenance", "maintenance_request", maint_req.id)
        return maint_req

    @staticmethod
    async def reject_request(
        db: AsyncSession, org_id: uuid.UUID, request_id: uuid.UUID, actor_id: uuid.UUID
    ) -> MaintenanceRequest:
        maint_repo = MaintenanceRequestRepository(db)

        maint_req = await maint_repo.get_by_id_and_org(request_id, org_id)
        if not maint_req:
            raise NotFoundError("Maintenance request not found.")
        if maint_req.status != MaintenanceStatus.pending:
            raise ConflictError("Only pending maintenance requests can be rejected.")

        maint_req.status = MaintenanceStatus.rejected
        maint_req.resolved_at = datetime.now(timezone.utc)
        await db.flush()

        # Notify requester
        await create_notification(
            db,
            org_id=org_id,
            user_id=maint_req.raised_by_id,
            type_="maintenance_rejected",
            message="Your maintenance request has been rejected.",
            related_type="maintenance_request",
            related_id=maint_req.id
        )

        await log_activity(db, org_id, actor_id, "reject_maintenance", "maintenance_request", maint_req.id)
        return maint_req

    @staticmethod
    async def assign_technician(
        db: AsyncSession, org_id: uuid.UUID, request_id: uuid.UUID, req: MaintenanceRequestUpdate, actor_id: uuid.UUID
    ) -> MaintenanceRequest:
        maint_repo = MaintenanceRequestRepository(db)

        maint_req = await maint_repo.get_by_id_and_org(request_id, org_id)
        if not maint_req:
            raise NotFoundError("Maintenance request not found.")
            
        if maint_req.status not in (MaintenanceStatus.approved, MaintenanceStatus.technician_assigned):
            raise ConflictError("Technician can only be assigned to approved or already assigned requests.")

        if req.technician_name:
            maint_req.technician_name = req.technician_name
            maint_req.status = MaintenanceStatus.technician_assigned
            
        if req.status:
            maint_req.status = req.status
            
        await db.flush()
        await log_activity(db, org_id, actor_id, "assign_technician_maintenance", "maintenance_request", maint_req.id, {"technician": req.technician_name})
        return maint_req

    @staticmethod
    async def resolve_request(
        db: AsyncSession, org_id: uuid.UUID, request_id: uuid.UUID, actor_id: uuid.UUID
    ) -> MaintenanceRequest:
        maint_repo = MaintenanceRequestRepository(db)
        asset_repo = AssetRepository(db)

        maint_req = await maint_repo.get_by_id_and_org(request_id, org_id)
        if not maint_req:
            raise NotFoundError("Maintenance request not found.")
            
        if maint_req.status in (MaintenanceStatus.resolved, MaintenanceStatus.rejected, MaintenanceStatus.pending):
            raise ConflictError("Only approved/in-progress maintenance requests can be resolved.")

        # Lock asset
        asset = await asset_repo.get_by_id_and_org(maint_req.asset_id, org_id, lock=True)
        if not asset:
            raise NotFoundError("Asset not found.")

        # Return asset to available
        AssetService.validate_transition(asset.status, AssetStatus.available)
        asset.status = AssetStatus.available
        
        maint_req.status = MaintenanceStatus.resolved
        maint_req.resolved_at = datetime.now(timezone.utc)
        await db.flush()

        # Notify requester
        await create_notification(
            db,
            org_id=org_id,
            user_id=maint_req.raised_by_id,
            type_="maintenance_resolved",
            message=f"Maintenance work for asset '{asset.name}' has been completed and marked as resolved.",
            related_type="maintenance_request",
            related_id=maint_req.id
        )

        await log_activity(db, org_id, actor_id, "resolve_maintenance", "maintenance_request", maint_req.id)
        return maint_req
