from typing import Any

from pydantic import BaseModel


class DatasetColumn(BaseModel):
    name: str
    type: str | None = None
    nullable: bool = True
    primary_key: bool = False


class DatasetTable(BaseModel):
    name: str
    columns: list[DatasetColumn]
    sample_rows: list[dict[str, Any]]


class GeneratedDataset(BaseModel):
    source_filename: str
    tables: list[DatasetTable]