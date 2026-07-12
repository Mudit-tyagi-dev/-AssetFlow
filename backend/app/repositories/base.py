from typing import Generic, TypeVar, Type, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get(self, id: UUID, org_id: Optional[UUID] = None) -> Optional[ModelType]:
        stmt = select(self.model).where(self.model.id == id)
        if org_id is not None and hasattr(self.model, "org_id"):
            stmt = stmt.where(self.model.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_multi(self, org_id: Optional[UUID] = None, skip: int = 0, limit: int = 20) -> List[ModelType]:
        stmt = select(self.model)
        if org_id is not None and hasattr(self.model, "org_id"):
            stmt = stmt.where(self.model.org_id == org_id)
        
        if hasattr(self.model, "created_at"):
            stmt = stmt.order_by(self.model.created_at.desc())
        else:
            stmt = stmt.order_by(self.model.id)
            
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count(self, org_id: Optional[UUID] = None) -> int:
        stmt = select(func.count()).select_from(self.model)
        if org_id is not None and hasattr(self.model, "org_id"):
            stmt = stmt.where(self.model.org_id == org_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def create(self, obj_in: ModelType) -> ModelType:
        self.db.add(obj_in)
        await self.db.flush()
        return obj_in

    async def update(self, db_obj: ModelType, update_data: dict) -> ModelType:
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        await self.db.flush()
        return db_obj

    async def remove(self, id: UUID) -> Optional[ModelType]:
        db_obj = await self.get(id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.flush()
        return db_obj
