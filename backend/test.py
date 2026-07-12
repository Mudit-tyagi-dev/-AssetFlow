import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def test():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT org_id FROM users WHERE email='jhahimanshu930@gmail.com'"))
        org_id = res.scalar()
        
        from app.core.uuid import uuid7
        id = uuid7()
        
        await conn.execute(text(f"INSERT INTO asset_categories (id, org_id, name, status) VALUES ('{id}', '{org_id}', 'Test Category', 'active')"))
        print('Inserted!')

asyncio.run(test())
