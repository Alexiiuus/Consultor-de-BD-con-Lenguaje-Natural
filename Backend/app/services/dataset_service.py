import sqlite3
from pathlib import Path
from typing import Any

from app.schemas.dataset import DatasetColumn, DatasetTable, GeneratedDataset


class DatasetService:
    def generate_from_sqlite_file(
        self,
        file_path: Path,
        source_filename: str,
        sample_limit: int = 5,
    ) -> GeneratedDataset:
        tables: list[DatasetTable] = []

        connection = sqlite3.connect(file_path)
        connection.row_factory = sqlite3.Row

        try:
            cursor = connection.cursor()

            table_names = self._get_table_names(cursor)

            for table_name in table_names:
                columns = self._get_columns(cursor, table_name)
                sample_rows = self._get_sample_rows(cursor, table_name, sample_limit)

                tables.append(
                    DatasetTable(
                        name=table_name,
                        columns=columns,
                        sample_rows=sample_rows,
                    )
                )

            return GeneratedDataset(
                source_filename=source_filename,
                tables=tables,
            )

        finally:
            connection.close()

    def _get_table_names(self, cursor: sqlite3.Cursor) -> list[str]:
        cursor.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name NOT LIKE 'sqlite_%'
            ORDER BY name
            """
        )

        return [row["name"] for row in cursor.fetchall()]

    def _get_columns(
        self,
        cursor: sqlite3.Cursor,
        table_name: str,
    ) -> list[DatasetColumn]:
        cursor.execute(f'PRAGMA table_info("{table_name}")')
        rows = cursor.fetchall()

        return [
            DatasetColumn(
                name=row["name"],
                type=row["type"],
                nullable=not bool(row["notnull"]),
                primary_key=bool(row["pk"]),
            )
            for row in rows
        ]

    def _get_sample_rows(
        self,
        cursor: sqlite3.Cursor,
        table_name: str,
        limit: int,
    ) -> list[dict[str, Any]]:
        cursor.execute(f'SELECT * FROM "{table_name}" LIMIT ?', (limit,))
        rows = cursor.fetchall()

        return [dict(row) for row in rows]