from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.db_models import User


async def get_or_create_user(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(id=user_id, email=f"{user_id}@demo.her.local", name="Demo User")
    db.add(user)
    await db.flush()
    return user
