# Consultor de BD con Lenguaje Natural

Backend en **FastAPI** que permite consultar una base de datos usando lenguaje natural, sin necesidad de saber SQL.

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| Python | >= 3.11 |
| FastAPI | >= 0.115 |
| SQLAlchemy | >= 2.0 (async + asyncpg) |
| PostgreSQL | 16 |
| Alembic | >= 1.14 |
| pytest | >= 8.3 |
| Docker | Compose V2 |
| Mistral AI | API (modelo mistral-large-latest) |

---

## Requisitos previos

- Python >= 3.11
- PostgreSQL 16 (o Docker)
- Docker + Docker Compose (opcional, para levantar todo sin instalar nada localmente)

---

## Configuración de variables de entorno

```bash
cp Backend/.env.example Backend/.env
```

Las variables más importantes:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql+asyncpg://postgres:postgres@localhost:5432/backend` |
| `SECRET_KEY` | Clave para firmar JWT | `changeme-secret-key` |
| `MISTRAL_API_KEY` | API key de Mistral AI para NL-to-SQL | `tu-api-key-de-mistral` |
| `MISTRAL_MODEL` | Modelo de Mistral a usar | `mistral-large-latest` |
| `BACKEND_CORS_ORIGINS` | Orígenes permitidos por CORS | `http://localhost:8000,http://localhost:3000` |

> **Atención**: si usás Docker Compose, la URL de postgres cambia a `postgresql+asyncpg://postgres:postgres@postgres:5432/backend` (el hostname es el nombre del servicio `postgres`, no `localhost`). El `.env.example` tiene ambas versiones comentadas.

---

## Instalación local

```bash
cd Backend

python -m venv .venv
source .venv/bin/activate

pip install -e ".[dev]"
```

---

## Ejecución local

```bash
cd Backend
source .venv/bin/activate

# Aplicar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload
```

El servidor se levanta en `http://localhost:8000`.

---

## Ejecución con Docker Compose

```bash
cd Backend

# Asegurate de tener DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/backend en .env

# Construir y levantar
docker compose up --build

# O en segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

Esto levanta dos servicios:
- **backend** — FastAPI con uvicorn en `:8000`
- **postgres** — PostgreSQL 16 en `:5433` del host (`:5432` interno)

---

## Migraciones (Alembic)

Los comandos se ejecutan localmente o dentro del contenedor:

```bash
cd Backend
source .venv/bin/activate

# Crear nueva migración automática
alembic revision --autogenerate -m "descripcion del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir la última
alembic downgrade -1

# Ver estado
alembic current
```

> Dentro del contenedor Docker: `docker compose exec backend alembic upgrade head`

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

| URL | Descripción |
|---|---|---|
| `http://localhost:8000` | Raíz del API |
| `http://localhost:8000/docs` | Swagger UI (documentación interactiva) |
| `http://localhost:8000/redoc` | ReDoc |
| `http://localhost:8000/api/v1/health` | Health check |
| `http://localhost:8000/api/v1/users/` | Listar usuarios |
| `http://localhost:8000/api/v1/users/{id}` | Obtener usuario por ID |
| `POST http://localhost:8000/api/v1/users/` | Crear usuario |
| `http://localhost:8000/api/v1/datasets/from-db` | Subir archivo de BD y crear dataset |
| `http://localhost:8000/api/v1/datasets/{id}/query` | Ejecutar SQL sobre un dataset |
| `http://localhost:8000/api/v1/datasets/{id}/nl-query` | Consulta en lenguaje natural sobre un dataset |

---

## Estructura del proyecto

```
.
├── Backend/                     # Código del backend
│   ├── app/
│   │   ├── core/               # Configuración, seguridad, excepciones
│   │   ├── api/v1/             # Routers y endpoints
│   │   ├── db/                 # Conexión a base de datos
│   │   ├── models/             # Modelos SQLAlchemy
│   │   ├── schemas/            # Schemas Pydantic
│   │   ├── repositories/       # Acceso a datos
│   │   ├── services/           # Lógica de negocio
│   │   └── utils/              # Utilidades (paginación)
│   ├── tests/                  # Tests con pytest
│   ├── alembic/                # Migraciones de base de datos
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pyproject.toml
├── .gitignore
└── README.md
```

---

## Comandos útiles

```bash
# ── Local ──────────────────────────────────────────
cd Backend
source .venv/bin/activate
uvicorn app.main:app --reload          # Iniciar servidor
pytest -v                              # Correr tests
alembic upgrade head                   # Migrar base de datos

# ── Docker ─────────────────────────────────────────
docker compose up --build              # Construir y levantar
docker compose up -d --build           # En segundo plano
docker compose down                    # Detener servicios
docker compose logs -f                 # Ver logs en vivo
docker compose exec backend pytest -v  # Tests dentro del contenedor
docker compose exec backend alembic upgrade head  # Migrar dentro del contenedor
```

---

## Notas para desarrollo

- **No comittees** el archivo `.env` real. Usá `.env.example` como plantilla.
- Las migraciones de Alembic **deben versionarse** (`alembic/versions/`).
- Agregá tests para cada nueva feature.
- Corré `pytest` antes de abrir un PR.
