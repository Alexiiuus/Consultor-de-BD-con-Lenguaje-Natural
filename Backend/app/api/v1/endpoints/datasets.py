import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.schemas.dataset import GeneratedDataset
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["datasets"])


ALLOWED_EXTENSIONS = {".db", ".sqlite", ".sqlite3"}


@router.post(
    "/from-db",
    response_model=GeneratedDataset,
    status_code=status.HTTP_201_CREATED,
)
async def generate_dataset_from_db(
    file: UploadFile = File(...),
    sample_limit: int = Query(default=5, ge=1, le=100),
) -> GeneratedDataset:
    filename = file.filename or ""

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no soportado. Subí un archivo .db, .sqlite o .sqlite3.",
        )

    service = DatasetService()

    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
        temp_path = Path(temp_file.name)

        try:
            shutil.copyfileobj(file.file, temp_file)
        finally:
            await file.close()

    try:
        return service.generate_from_sqlite_file(
            file_path=temp_path,
            source_filename=filename,
            sample_limit=sample_limit,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No se pudo generar el dataset desde el archivo enviado: {exc}",
        ) from exc

    finally:
        temp_path.unlink(missing_ok=True)