from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    email: str
    full_name: str
    is_active: bool = True


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
