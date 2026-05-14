from pydantic import BaseModel, Field
from typing import TypeVar, Generic, List

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int

def get_pagination_params(page: int = 1, size: int = 10):
    return {"skip": (page - 1) * size, "limit": size, "page": page, "size": size}
