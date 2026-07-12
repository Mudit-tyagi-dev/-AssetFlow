import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.uuid import uuid7

from app.core.exceptions import NotFoundError, ConflictError, AssetAlreadyAllocatedError
from app.models.allocation import AssetAllocation, TransferRequest
from app.models.enums import AssetStatus, HolderType, AllocationStatus, TransferStatus
from app.repositories.asset import AssetRepository, AssetCategoryRepository
from app.repositories.allocation import AssetAllocationRepository, TransferRequestRepository
from app.repositories.user import UserRepository
from app.repositories.org import DepartmentRepository
from app.schemas.allocation import AssetAllocationCreate, AssetAllocationReturn, TransferRequestCreate, TransferRequestUpdate
from app.services.utils import log_activity, create_notification

class AllocationService:
    @staticmethod
    async def allocate_asset(
        db: AsyncSession, org_id: uuid.UUID, req: AssetAllocationCreate, actor_id: uuid.UUID
    ) -> AssetAllocation:
        asset_repo = AssetRepository(db)
        alloc_repo = AssetAllocationRepository(db)
        
        # Row-lock the asset for concurrency safety
        asset = await asset_repo.get_by_id_and_org(req.asset_id, org_id, lock=True)
        if not asset:
            raise NotFoundError("Asset not found.")

        # Check if already allocated or not available
        if asset.status != AssetStatus.available:
            # Query the active allocation to retrieve holder info
            active_alloc = await alloc_repo.get_active_by_asset(asset.id, org_id)
            if active_alloc:
                holder_name = "Unknown"
                if active_alloc.allocated_to_type == HolderType.employee:
                    user_repo = UserRepository(db)
                    emp = await user_repo.get(active_alloc.allocated_to_id)
                    if emp:
                        holder_name = emp.name
                elif active_alloc.allocated_to_type == HolderType.department:
                    dept_repo = DepartmentRepository(db)
                    dept = await dept_repo.get(active_alloc.allocated_to_id)
                    if dept:
                        holder_name = dept.name
                        
                raise AssetAlreadyAllocatedError(
                    message=f"This asset is currently held by {holder_name}. Raise a transfer request instead.",
                    details={
                        "current_holder_id": str(active_alloc.allocated_to_id),
                        "current_holder_type": active_alloc.allocated_to_type.value,
                        "current_holder_name": holder_name
                    }
                )
            else:
                raise ConflictError(f"Asset is not available for checkout (current status: {asset.status.value}).")

        # Validate checkout target
        if req.allocated_to_type == HolderType.employee:
            user_repo = UserRepository(db)
            employee = await user_repo.get_by_id_and_org(req.allocated_to_id, org_id)
            if not employee:
                raise NotFoundError("Employee not found.")
            if employee.status != "active":
                raise ConflictError("Cannot checkout to an inactive employee.")
            target_name = employee.name
        else:
            dept_repo = DepartmentRepository(db)
            dept = await dept_repo.get_by_id_and_org(req.allocated_to_id, org_id)
            if not dept:
                raise NotFoundError("Department not found.")
            if dept.status != "active":
                raise ConflictError("Cannot checkout to an inactive department.")
            target_name = dept.name

        # Create allocation entry
        allocation = AssetAllocation(
            id=uuid7(),
            org_id=org_id,
            asset_id=asset.id,
            allocated_to_type=req.allocated_to_type,
            allocated_to_id=req.allocated_to_id,
            allocated_by_id=actor_id,
            allocated_at=datetime.now(timezone.utc),
            expected_return_date=req.expected_return_date,
            status=AllocationStatus.active
        )
        db.add(allocation)

        # Update asset status & holder details
        asset.status = AssetStatus.allocated
        asset.current_holder_type = req.allocated_to_type
        asset.current_holder_id = req.allocated_to_id
        await db.flush()

        # Send notification to target employee (if employee type)
        if req.allocated_to_type == HolderType.employee:
            await create_notification(
                db,
                org_id=org_id,
                user_id=req.allocated_to_id,
                type_="asset_assigned",
                message=f"Asset '{asset.name}' ({asset.asset_tag}) has been allocated to you.",
                related_type="asset",
                related_id=asset.id
            )

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="allocate_asset",
            entity_type="asset",
            entity_id=asset.id,
            metadata={"allocated_to_id": str(req.allocated_to_id), "allocated_to_name": target_name}
        )

        return allocation

    @staticmethod
    async def return_asset(
        db: AsyncSession, org_id: uuid.UUID, asset_id: uuid.UUID, req: AssetAllocationReturn, actor_id: uuid.UUID
    ) -> AssetAllocation:
        asset_repo = AssetRepository(db)
        alloc_repo = AssetAllocationRepository(db)

        # Lock the asset row
        asset = await asset_repo.get_by_id_and_org(asset_id, org_id, lock=True)
        if not asset:
            raise NotFoundError("Asset not found.")

        # Find active allocation
        active_alloc = await alloc_repo.get_active_by_asset(asset.id, org_id, lock=True)
        if not active_alloc:
            raise ConflictError("No active allocation found for this asset.")

        # Mark allocation returned
        active_alloc.returned_at = datetime.now(timezone.utc)
        active_alloc.condition_check_in_notes = req.condition_check_in_notes
        active_alloc.status = AllocationStatus.returned

        # Return asset to available
        asset.status = AssetStatus.available
        asset.current_holder_type = None
        asset.current_holder_id = None
        await db.flush()

        # Notify user (if employee type)
        if active_alloc.allocated_to_type == HolderType.employee:
            await create_notification(
                db,
                org_id=org_id,
                user_id=active_alloc.allocated_to_id,
                type_="asset_returned",
                message=f"Asset '{asset.name}' ({asset.asset_tag}) has been successfully returned.",
                related_type="asset",
                related_id=asset.id
            )

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="return_asset",
            entity_type="asset",
            entity_id=asset.id,
            metadata={"notes": req.condition_check_in_notes}
        )

        return active_alloc

    @staticmethod
    async def request_transfer(
        db: AsyncSession, org_id: uuid.UUID, req: TransferRequestCreate, actor_id: uuid.UUID
    ) -> TransferRequest:
        asset_repo = AssetRepository(db)
        alloc_repo = AssetAllocationRepository(db)
        transfer_repo = TransferRequestRepository(db)

        # Check asset
        asset = await asset_repo.get_by_id_and_org(req.asset_id, org_id)
        if not asset:
            raise NotFoundError("Asset not found.")

        # Check if asset is allocated
        if asset.status != AssetStatus.allocated:
            raise ConflictError("Asset must be allocated to be transferred.")

        # Check if there is already an active transfer request for this asset
        existing_transfer = await transfer_repo.get_active_by_asset(asset.id, org_id)
        if existing_transfer:
            raise ConflictError("An active transfer request already exists for this asset.")

        # Validate target
        if req.to_holder_type == HolderType.employee:
            user_repo = UserRepository(db)
            employee = await user_repo.get_by_id_and_org(req.to_holder_id, org_id)
            if not employee:
                raise NotFoundError("Target employee not found.")
        else:
            dept_repo = DepartmentRepository(db)
            dept = await dept_repo.get_by_id_and_org(req.to_holder_id, org_id)
            if not dept:
                raise NotFoundError("Target department not found.")

        # Create request
        transfer = TransferRequest(
            id=uuid7(),
            org_id=org_id,
            asset_id=asset.id,
            requested_by_id=actor_id,
            to_holder_type=req.to_holder_type,
            to_holder_id=req.to_holder_id,
            status=TransferStatus.requested,
            created_at=datetime.now(timezone.utc)
        )
        db.add(transfer)
        await db.flush()

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action="request_transfer",
            entity_type="transfer_request",
            entity_id=transfer.id
        )

        return transfer

    @staticmethod
    async def resolve_transfer(
        db: AsyncSession, org_id: uuid.UUID, transfer_id: uuid.UUID, req: TransferRequestUpdate, actor_id: uuid.UUID
    ) -> TransferRequest:
        transfer_repo = TransferRequestRepository(db)
        asset_repo = AssetRepository(db)
        alloc_repo = AssetAllocationRepository(db)

        # Retrieve request
        transfer = await transfer_repo.get_by_id_and_org(transfer_id, org_id)
        if not transfer:
            raise NotFoundError("Transfer request not found.")
        if transfer.status != TransferStatus.requested:
            raise ConflictError(f"Transfer request is already resolved (status: {transfer.status.value}).")

        # Lock the asset row
        asset = await asset_repo.get_by_id_and_org(transfer.asset_id, org_id, lock=True)
        if not asset:
            raise NotFoundError("Asset not found.")

        transfer.status = req.status
        transfer.approved_by_id = actor_id
        transfer.resolved_at = datetime.now(timezone.utc)

        if req.status == TransferStatus.approved:
            # Complete old allocation
            old_alloc = await alloc_repo.get_active_by_asset(asset.id, org_id, lock=True)
            if old_alloc:
                old_alloc.returned_at = datetime.now(timezone.utc)
                old_alloc.status = AllocationStatus.transferred

            # Create new allocation
            new_alloc = AssetAllocation(
                id=uuid7(),
                org_id=org_id,
                asset_id=asset.id,
                allocated_to_type=transfer.to_holder_type,
                allocated_to_id=transfer.to_holder_id,
                allocated_by_id=actor_id,
                allocated_at=datetime.now(timezone.utc),
                status=AllocationStatus.active
            )
            db.add(new_alloc)

            # Update asset holder
            asset.current_holder_type = transfer.to_holder_type
            asset.current_holder_id = transfer.to_holder_id
            
            # Send notifications
            if transfer.to_holder_type == HolderType.employee:
                await create_notification(
                    db,
                    org_id=org_id,
                    user_id=transfer.to_holder_id,
                    type_="asset_assigned",
                    message=f"Asset '{asset.name}' ({asset.asset_tag}) has been transferred to you.",
                    related_type="asset",
                    related_id=asset.id
                )
            # Notify original holder (if employee)
            if old_alloc and old_alloc.allocated_to_type == HolderType.employee:
                await create_notification(
                    db,
                    org_id=org_id,
                    user_id=old_alloc.allocated_to_id,
                    type_="asset_transferred",
                    message=f"Asset '{asset.name}' ({asset.asset_tag}) has been transferred out of your allocation.",
                    related_type="asset",
                    related_id=asset.id
                )

        await db.flush()
        
        # Notify requester
        await create_notification(
            db,
            org_id=org_id,
            user_id=transfer.requested_by_id,
            type_="transfer_resolved",
            message=f"Your transfer request for asset '{asset.name}' was {req.status.value}.",
            related_type="transfer_request",
            related_id=transfer.id
        )

        await log_activity(
            db,
            org_id=org_id,
            actor_id=actor_id,
            action=f"resolve_transfer_{req.status.value}",
            entity_type="transfer_request",
            entity_id=transfer.id
        )

        return transfer
