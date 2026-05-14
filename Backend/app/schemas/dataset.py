from pydantic import BaseModel
from typing import Any
from uuid import UUID



class DatasetColumn(BaseModel):
    name: str
    type: str | None = None
    nullable: bool = True
    primary_key: bool = False


class DatasetTable(BaseModel):
    name: str
    columns: list[DatasetColumn]
    sample_rows: list[dict[str, Any]] = []


class GeneratedDataset(BaseModel):
    id: UUID
    source_filename: str
    tables: list[DatasetTable]


class SqlQueryRequest(BaseModel):
    sql_query: str
    limit: int = 100


class SqlQueryResult(BaseModel):
    columns: list[str]
    rows: list[dict[str, Any]]
    row_count: int