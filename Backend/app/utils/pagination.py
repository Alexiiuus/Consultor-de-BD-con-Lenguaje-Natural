from math import ceil

from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20


class PaginatedResult(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int


def paginate(
    items: list,
    total: int,
    page: int,
    page_size: int,
) -> PaginatedResult:
    return PaginatedResult(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if page_size > 0 else 0,
    )
