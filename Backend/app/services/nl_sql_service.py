import json
import re

from mistralai.client import Mistral

from app.core.config import settings
from app.schemas.dataset import DatasetTable


class NaturalLanguageSqlService:
    def __init__(self) -> None:
        self.client = Mistral(api_key=settings.MISTRAL_API_KEY)
        self.model = settings.MISTRAL_MODEL

    def generate_sql(
        self,
        question: str,
        tables: list[DatasetTable],
        limit: int,
    ) -> str:
        schema_context = self._build_schema_context(tables)

        system_prompt = self._build_system_prompt(limit=limit)

        user_prompt = f"""
            Esquema disponible de la base de datos:

            {schema_context}

            Consulta del usuario en lenguaje natural:
            {question}

            Respondé únicamente con JSON válido, sin Markdown.
            """

        response = self.client.chat.complete(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0,
            max_tokens=500,
        )

        content = response.choices[0].message.content

        return self._extract_sql_from_model_response(content)

    def _build_system_prompt(self, limit: int) -> str:
        return f"""
            Sos un asistente experto en SQLite.

            Tu tarea es convertir preguntas en lenguaje natural a consultas SQL SQLite.

            Reglas obligatorias:
            - Devolvé únicamente un JSON válido.
            - El JSON debe tener esta forma exacta:
            {{"sql_query": "SELECT ..."}}
            - Generá solo consultas de lectura.
            - Solo podés usar SELECT o WITH.
            - No uses INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE, TRUNCATE, ATTACH, DETACH, VACUUM, PRAGMA ni REINDEX.
            - No inventes tablas.
            - No inventes columnas.
            - Usá únicamente las tablas y columnas del esquema provisto.
            - Si la pregunta no se puede responder con el esquema provisto, devolvé:
            {{"sql_query": ""}}
            - Agregá LIMIT {limit} si la consulta no tiene LIMIT.
            - La SQL debe ser compatible con SQLite.
            - No expliques nada.
            - No devuelvas Markdown.
            """

    def _build_schema_context(
        self,
        tables: list[DatasetTable],
    ) -> str:
        lines: list[str] = []

        for table in tables:
            lines.append(f"Tabla: {table.name}")

            for column in table.columns:
                column_description = f"- {column.name}"

                if column.type:
                    column_description += f" ({column.type})"

                if column.primary_key:
                    column_description += " PRIMARY KEY"

                lines.append(column_description)

            lines.append("")

        return "\n".join(lines)

    def _extract_sql_from_model_response(
        self,
        content: str,
    ) -> str:
        cleaned = content.strip()

        cleaned = re.sub(r"^```json", "", cleaned)
        cleaned = re.sub(r"^```", "", cleaned)
        cleaned = re.sub(r"```$", "", cleaned)
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError(
                "Mistral no devolvió un JSON válido con la SQL generada."
            ) from exc

        sql_query = data.get("sql_query")

        if not isinstance(sql_query, str):
            raise ValueError(
                "La respuesta de Mistral no contiene el campo sql_query."
            )

        return sql_query.strip()