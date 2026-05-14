from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = UserRepository(db)

    async def get_all(self) -> list[UserRead]:
        users = await self.repo.get_all()
        return [UserRead.model_validate(u) for u in users]

    async def get_by_id(self, user_id: int) -> UserRead | None:
        user = await self.repo.get_by_id(user_id)
        if user is None:
            return None
        return UserRead.model_validate(user)

    async def create(self, user_in: UserCreate) -> UserRead:
        user = User(**user_in.model_dump())
        user = await self.repo.create(user)
        return UserRead.model_validate(user)
