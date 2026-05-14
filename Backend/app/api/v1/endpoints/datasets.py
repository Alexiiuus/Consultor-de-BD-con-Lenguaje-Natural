from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Path, UploadFile, status

from app.schemas.dataset import GeneratedDataset, SqlQueryRequest, SqlQueryResult, NaturalLanguageSqlRequest, NaturalLanguageSqlResponse
from app.services.dataset_service import DatasetService

from app.services.nl_sql_service import NaturalLanguageSqlService

router = APIRouter()


ALLOWED_EXTENSIONS = {".db", ".sqlite", ".sqlite3"}


@router.post(
    "/from-db",
    response_model=GeneratedDataset,
    status_code=status.HTTP_201_CREATED,
)
async def create_dataset_from_db(
    file: UploadFile = File(...),
) -> GeneratedDataset:
    service = DatasetService()

    try:
        return service.create_dataset_from_uploaded_file(file)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No se pudo crear el dataset desde la BD cargada: {exc}",
        ) from exc

    finally:
        await file.close()

@router.post(
    "/{dataset_id}/query",
    response_model=SqlQueryResult,
)
async def execute_query_on_existing_dataset(
    payload: SqlQueryRequest,
    dataset_id: UUID = Path(...),
) -> SqlQueryResult:
    service = DatasetService()

    try:
        result = service.execute_readonly_query_by_dataset_id(
            dataset_id=dataset_id,
            query=payload.sql_query,
            limit=payload.limit,
        )

        return SqlQueryResult(**result)

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No se pudo ejecutar la consulta SQL: {exc}",
        ) from exc

@router.post(
    "/{dataset_id}/nl-query",
    response_model=NaturalLanguageSqlResponse,
)
async def generate_sql_from_natural_language(
    dataset_id: UUID = Path(...),
    payload: NaturalLanguageSqlRequest = ...,
) -> NaturalLanguageSqlResponse:
    dataset_service = DatasetService()
    nl_sql_service = NaturalLanguageSqlService()

    try:
        file_path = dataset_service._get_dataset_file_path(dataset_id)

        if file_path is None:
            raise FileNotFoundError("No existe una BD cargada con ese dataset_id.")

        tables = dataset_service.inspect_sqlite_file(
            file_path=file_path,
            sample_limit=0,
        )

        sql_query = nl_sql_service.generate_sql(
            question=payload.question,
            tables=tables,
            limit=payload.limit,
        )

        if not sql_query:
            raise ValueError(
                "No se pudo generar una consulta SQL válida para esa pregunta."
            )

        dataset_service._validate_readonly_query(sql_query)
        dataset_service.validate_sql_against_dataset(
            dataset_id=dataset_id,
            query=sql_query,
        )

        if not payload.execute:
            return NaturalLanguageSqlResponse(
                question=payload.question,
                sql_query=sql_query,
                executed=False,
            )

        result = dataset_service.execute_readonly_query_by_dataset_id(
            dataset_id=dataset_id,
            query=sql_query,
            limit=payload.limit,
        )

        return NaturalLanguageSqlResponse(
            question=payload.question,
            sql_query=sql_query,
            executed=True,
            columns=result["columns"],
            rows=result["rows"],
            row_count=result["row_count"],
        )

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No se pudo generar la consulta SQL: {exc}",
        ) from exc