from uuid import UUID

from fastapi import APIRouter, File, HTTPException, Path, Query, UploadFile, status

from app.schemas.dataset import GeneratedDataset, SqlQueryRequest, SqlQueryResult
from app.services.dataset_service import DatasetService


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