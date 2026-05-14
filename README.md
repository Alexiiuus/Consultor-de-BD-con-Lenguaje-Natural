# Consultor de BD con Lenguaje Natural

Backend en **FastAPI** que permite subir archivos SQLite, inspeccionar su esquema, ejecutar consultas SQL de solo lectura y convertir preguntas en lenguaje natural a SQL usando **Mistral AI**.

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| Python | >= 3.11 |
| FastAPI | >= 0.115 |
| Uvicorn | (servidor ASGI con hot-reload) |
| pytest | >= 8.3 |
| Docker | Compose V2 |
| Mistral AI | API (modelo mistral-large-latest) |

---

## Requisitos previos

- Python >= 3.11
- pip (gestor de paquetes)
- Docker + Docker Compose (opcional, para ejecución containerizada)

---

## Configuración de variables de entorno

```bash
cp Backend/.env.example Backend/.env
```

Editar `Backend/.env` y completar al menos `MISTRAL_API_KEY`.

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `MISTRAL_API_KEY` | Sí | — | API key de Mistral AI |
| `MISTRAL_MODEL` | No | `mistral-large-latest` | Modelo de Mistral |
| `APP_NAME` | No | `Backend API` | Nombre visible |
| `APP_VERSION` | No | `0.1.0` | Versión |
| `DEBUG` | No | `false` | Modo debug |
| `API_V1_PREFIX` | No | `/api/v1` | Prefijo de rutas |
| `BACKEND_CORS_ORIGINS` | No | `http://localhost:8000,http://localhost:3000` | Orígenes CORS |

---

## Instalación local

```bash
cd Backend

python -m venv .venv
source .venv/bin/activate

pip install -e ".[dev]"
```

El flag `-e` permite editar código sin reinstalar. `.[dev]` incluye pytest y httpx.

---

## Ejecución local

```bash
cd Backend
source .venv/bin/activate

uvicorn app.main:app --reload
```

`--reload` reinicia el servidor automáticamente al detectar cambios en el código.

Servidor en `http://localhost:8000`.

---

## Ejecución con Docker

```bash
cd Backend

# Construir imagen y levantar contenedor (modo interactivo)
docker compose up --build

# En segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

Solo se levanta el servicio `backend` (FastAPI). No requiere base de datos externa.

---

## Tests

```bash
cd Backend
source .venv/bin/activate
pytest -v
```

O dentro del contenedor:

```bash
docker compose exec backend pytest -v
```

---

## Endpoints

| Método | URL | Descripción |
|---|---|---|
| GET | `/` | Raíz del API |
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/datasets/from-db` | Subir archivo SQLite y crear dataset |
| POST | `/api/v1/datasets/{id}/query` | Ejecutar SQL readonly sobre un dataset |
| POST | `/api/v1/datasets/{id}/nl-query` | Lenguaje natural → SQL (con o sin ejecución) |

Documentación interactiva:

- `http://localhost:8000/docs` — Swagger UI
- `http://localhost:8000/redoc` — ReDoc

---

## Flujo de uso

1. **`POST /api/v1/datasets/from-db`** — subís un archivo `.db`, `.sqlite` o `.sqlite3`. Se guarda como dataset y responde con el esquema (tablas, columnas, filas de muestra).
2. **`POST /api/v1/datasets/{id}/query`** — ejecutás SQL de solo lectura sobre el dataset. Incluye validación contra operaciones peligrosas (INSERT, DROP, etc.).
3. **`POST /api/v1/datasets/{id}/nl-query`** — enviás una pregunta en lenguaje natural. Mistral genera la SQL, se valida contra el esquema real y opcionalmente se ejecuta (`execute: true/false`).

---

## Estructura del proyecto

```
Backend/
├── app/
│   ├── main.py                 # FastAPI app, CORS, router raíz
│   ├── core/
│   │   └── config.py           # Settings desde .env (pydantic-settings)
│   ├── api/v1/
│   │   ├── router.py           # Router principal (mountea endpoints)
│   │   └── endpoints/
│   │       ├── health.py       # GET /health
│   │       └── datasets.py     # POST /from-db, /{id}/query, /{id}/nl-query
│   ├── schemas/
│   │   └── dataset.py          # Pydantic: DatasetColumn, GeneratedDataset,
│   │                            # SqlQueryRequest/Result, NaturalLanguageSqlRequest/Response
│   ├── services/
│   │   ├── dataset_service.py  # Subida, inspección, validación y consulta de SQLite
│   │   └── nl_sql_service.py   # Generación de SQL vía Mistral AI
│   └── storage/datasets/       # Archivos SQLite subidos por el usuario
├── tests/
│   ├── conftest.py             # Fixture TestClient
│   └── test_health.py          # Test de health check
├── Dockerfile                  # python:3.12-slim + uvicorn
├── docker-compose.yml          # Servicio backend
└── pyproject.toml              # Dependencias y config pytest
```

---

## Comandos útiles

```bash
cd Backend
source .venv/bin/activate

uvicorn app.main:app --reload     # Iniciar servidor local
pytest -v                         # Correr tests

docker compose up --build         # Construir y levantar
docker compose up -d --build      # En segundo plano
docker compose down               # Detener
docker compose logs -f            # Logs en vivo
docker compose exec backend pytest -v   # Tests en contenedor
```

---

## Notas para desarrollo

- **No comittees** `.env`. Usá `.env.example` como plantilla.
- Los datasets subidos se almacenan en `Backend/app/storage/datasets/` (ya ignorado por `.gitignore`).
- `MISTRAL_API_KEY` es obligatoria para que funcione el endpoint NL-to-SQL.
- Agregá tests para cada nuevo endpoint.
- El proyecto no usa base de datos externa ni migraciones. La persistencia es sobre archivos SQLite subidos por el usuario.
