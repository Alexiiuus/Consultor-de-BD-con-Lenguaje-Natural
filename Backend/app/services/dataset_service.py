import re
import shutil
import sqlite3
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4

from fastapi import UploadFile

from app.schemas.dataset import DatasetColumn, DatasetTable, GeneratedDataset


class DatasetService:
    STORAGE_PATH = Path("storage/datasets")
    ALLOWED_EXTENSIONS = {".db", ".sqlite", ".sqlite3"}

    def create_dataset_from_uploaded_file(
        self,
        file: UploadFile,
    ) -> GeneratedDataset:
        filename = file.filename or ""
        extension = Path(filename).suffix.lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise ValueError(
                "Formato no soportado. Subí un archivo .db, .sqlite o .sqlite3."
            )

        dataset_id = uuid4()

        self.STORAGE_PATH.mkdir(parents=True, exist_ok=True)

        stored_file_path = self.STORAGE_PATH / f"{dataset_id}{extension}"

        with stored_file_path.open("wb") as stored_file:
            shutil.copyfileobj(file.file, stored_file)

        try:
            tables = self.inspect_sqlite_file(stored_file_path)

            return GeneratedDataset(
                id=dataset_id,
                source_filename=filename,
                tables=tables,
            )

        except Exception:
            stored_file_path.unlink(missing_ok=True)
            raise

    def inspect_sqlite_file(
        self,
        file_path: Path,
        sample_limit: int = 5,
    ) -> list[DatasetTable]:
        tables: list[DatasetTable] = []

        readonly_uri = f"file:{file_path}?mode=ro"

        connection = sqlite3.connect(
            readonly_uri,
            uri=True,
        )
        connection.row_factory = sqlite3.Row

        try:
            cursor = connection.cursor()
            cursor.execute("PRAGMA query_only = ON")

            table_names = self._get_table_names(cursor)

            for table_name in table_names:
                columns = self._get_columns(cursor, table_name)
                sample_rows = self._get_sample_rows(
                    cursor=cursor,
                    table_name=table_name,
                    limit=sample_limit,
                )

                tables.append(
                    DatasetTable(
                        name=table_name,
                        columns=columns,
                        sample_rows=sample_rows,
                    )
                )

            return tables

        finally:
            connection.close()

    def execute_readonly_query_by_dataset_id(
        self,
        dataset_id: UUID,
        query: str,
        limit: int = 100,
    ) -> dict[str, Any]:
        self._validate_readonly_query(query)

        file_path = self._get_dataset_file_path(dataset_id)

        if file_path is None:
            raise FileNotFoundError("No existe una BD cargada con ese dataset_id.")

        readonly_uri = f"file:{file_path}?mode=ro"

        connection = sqlite3.connect(
            readonly_uri,
            uri=True,
        )
        connection.row_factory = sqlite3.Row

        try:
            cursor = connection.cursor()
            cursor.execute("PRAGMA query_only = ON")

            clean_query = query.strip().rstrip(";")

            final_query = f"""
            SELECT *
            FROM (
                {clean_query}
            )
            LIMIT ?
            """

            cursor.execute(final_query, (limit,))
            rows = cursor.fetchall()

            columns = [description[0] for description in cursor.description or []]

            return {
                "columns": columns,
                "rows": [dict(row) for row in rows],
                "row_count": len(rows),
            }

        finally:
            connection.close()

    def _get_dataset_file_path(
        self,
        dataset_id: UUID,
    ) -> Path | None:
        for extension in self.ALLOWED_EXTENSIONS:
            file_path = self.STORAGE_PATH / f"{dataset_id}{extension}"

            if file_path.exists():
                return file_path

        return None

    def _get_table_names(
        self,
        cursor: sqlite3.Cursor,
    ) -> list[str]:
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

    def _validate_readonly_query(
        self,
        query: str,
    ) -> None:
        cleaned_query = query.strip()

        if not cleaned_query:
            raise ValueError("La query no puede estar vacía.")

        if ";" in cleaned_query.rstrip(";"):
            raise ValueError("Solo se permite ejecutar una única consulta SQL.")

        normalized_query = cleaned_query.rstrip(";").strip().lower()

        allowed_starts = ("select", "with")

        if not normalized_query.startswith(allowed_starts):
            raise ValueError(
                "Solo se permiten consultas de lectura: SELECT o WITH."
            )

        forbidden_keywords = [
            "insert",
            "update",
            "delete",
            "drop",
            "alter",
            "create",
            "replace",
            "truncate",
            "attach",
            "detach",
            "vacuum",
            "pragma",
            "reindex",
        ]

        pattern = r"\b(" + "|".join(forbidden_keywords) + r")\b"

        if re.search(pattern, normalized_query):
            raise ValueError(
                "La query contiene operaciones no permitidas sobre la base de datos."
            )

    def validate_sql_against_dataset(
        self,
        dataset_id: UUID,
        query: str,
    ) -> None:
        file_path = self._get_dataset_file_path(dataset_id)

        if file_path is None:
            raise FileNotFoundError("No existe una BD cargada con ese dataset_id.")

        readonly_uri = f"file:{file_path}?mode=ro"

        connection = sqlite3.connect(
            readonly_uri,
            uri=True,
        )

        try:
            cursor = connection.cursor()
            cursor.execute("PRAGMA query_only = ON")

            clean_query = query.strip().rstrip(";")

            validation_query = f"""
            SELECT *
            FROM (
                {clean_query}
            )
            LIMIT 0
            """

            cursor.execute(validation_query)

        finally:
            connection.close()