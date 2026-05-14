# Backend API

Backend base con **FastAPI**, **SQLAlchemy async**, **PostgreSQL**, **Docker** y buenas prácticas para aplicaciones escalables.

---

## Requisitos

- Python >= 3.11
- PostgreSQL (local o vía Docker)
- Docker & Docker Compose (opcional)

---

## Levantar localmente

```bash
# 1. Clonar y entrar al directorio
cd Backend

# 2. Crear entorno virtual e instalar dependencias
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# 3. Copiar .env.example a .env y ajustar si es necesario
cp .env.example .env

# 4. Crear la base de datos (si se usa Postgres local)
createdb backend

# 5. Ejecutar migraciones
alembic upgrade head

# 6. Iniciar servidor
uvicorn app.main:app --reload
```

---

## Levantar con Docker Compose

```bash
cd Backend
cp .env.example .env
# Asegurate de usar DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/backend en .env
docker compose up --build
```

---

## Endpoints disponibles

| URL | Descripción |
| --- | ----------- |
| http://localhost:8000 | Raíz |
| http://localhost:8000/docs | Swagger UI |
| http://localhost:8000/api/v1/health | Health check |

---

## Ejecutar tests

```bash
cd Backend
pytest -v
```

---

## Migraciones con Alembic

```bash
# Crear una nueva migración
alembic revision --autogenerate -m "descripcion"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1
```

---

## Estructura del proyecto

```
Backend/
├── app/
│   ├── core/          # Config, seguridad, excepciones
│   ├── api/v1/        # Routers y endpoints
│   ├── db/            # Sesión y base declarativa
│   ├── models/        # Modelos SQLAlchemy
│   ├── schemas/       # Schemas Pydantic
│   ├── repositories/  # Capa de acceso a datos
│   ├── services/      # Lógica de negocio
│   └── utils/         # Utilidades (paginación, etc.)
├── tests/
├── alembic/           # Migraciones
├── Dockerfile
├── docker-compose.yml
└── pyproject.toml
```
