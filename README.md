# Consultor de BD con Lenguaje Natural

Aplicación full-stack que permite subir archivos **SQLite**, inspeccionar su esquema, ejecutar consultas SQL de solo lectura y convertir preguntas en lenguaje natural a SQL usando **Mistral AI**.

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4

---

## Tecnologías

### Backend
| Herramienta | Versión |
|---|---|
| Python | >= 3.11 |
| FastAPI | >= 0.115 |
| Uvicorn | (servidor ASGI con hot-reload) |
| pytest | >= 8.3 |
| Docker | Compose V2 |
| Mistral AI | API (modelo mistral-large-latest) |

### Frontend
| Herramienta | Versión |
|---|---|
| Node.js | >= 18 |
| React | ^19.2 |
| TypeScript | ~6.0 |
| Vite | ^8.0 |
| Tailwind CSS | ^4.3 |

---

## Requisitos previos

- **Python >= 3.11**
- **pip** (gestor de paquetes)
- **Node.js >= 18** y **npm**
- **Docker + Docker Compose** (opcional, para ejecución containerizada)

---

## Configuración de variables de entorno

### Backend

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

### Frontend

```bash
cp Frontend/.env.example Frontend/.env
```

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | URL base del backend |

---

## Instalación local

### Backend

```bash
cd Backend

python -m venv .venv
source .venv/bin/activate

pip install -e ".[dev]"
```

El flag `-e` permite editar código sin reinstalar. `.[dev]` incluye pytest y httpx.

### Frontend

```bash
cd Frontend
npm install
```

---

## Ejecución local

### Backend (una terminal)

```bash
cd Backend
source .venv/bin/activate

uvicorn app.main:app --reload
```

`--reload` reinicia el servidor automáticamente al detectar cambios.  
Servidor en `http://localhost:8000`.

### Frontend (otra terminal)

```bash
cd Frontend
npm run dev
```

Frontend en `http://localhost:5173`.

El frontend se conecta automáticamente al backend usando `VITE_API_BASE_URL`.

### Ejecución full-stack

1. Iniciá el backend (local o con Docker).
2. Iniciá el frontend con `npm run dev`.
3. Abrí `http://localhost:5173` en el navegador.
4. Subí un archivo `.db` o `.sqlite`.
5. Una vez cargado, aparecen los paneles de consulta NL, SQL manual y chat.

---

## Ejecución con Docker (solo backend)

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
El frontend se ejecuta localmente con Node.js.

---

## Tests

### Backend

```bash
cd Backend
source .venv/bin/activate
pytest -v
```

O dentro del contenedor:

```bash
docker compose exec backend pytest -v
```

### Frontend

No hay tests configurados actualmente. Para lint:

```bash
cd Frontend
npm run lint
```

---

## Endpoints del backend

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

1. **Subí un dataset** — desde el frontend o mediante `POST /api/v1/datasets/from-db`. Se guarda como dataset y responde con el esquema.
2. **Preguntá en lenguaje natural** — escribí una pregunta en el panel "Pregunta en lenguaje natural" o en el "Asistente conversacional". El backend convierte la pregunta a SQL usando Mistral AI, la valida contra el esquema real y la ejecuta.
3. **Ejecutá SQL manual** — usá el panel "Ejecutar SQL manual" para consultas `SELECT` directas.
4. **Chat conversacional** — el chat mantiene historial, permite reintentar mensajes con error y copiar la SQL generada.

---

## Estructura del proyecto

```
├── Backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, router raíz
│   │   ├── core/
│   │   │   └── config.py           # Settings desde .env (pydantic-settings)
│   │   ├── api/v1/
│   │   │   ├── router.py           # Router principal (mountea endpoints)
│   │   │   └── endpoints/
│   │   │       ├── health.py       # GET /health
│   │   │       └── datasets.py     # POST /from-db, /{id}/query, /{id}/nl-query
│   │   ├── schemas/
│   │   │   └── dataset.py          # Modelos Pydantic
│   │   ├── services/
│   │   │   ├── dataset_service.py  # Subida, inspección, validación y consulta de SQLite
│   │   │   └── nl_sql_service.py   # Generación de SQL vía Mistral AI
│   │   └── storage/datasets/       # Archivos SQLite subidos por el usuario
│   ├── tests/
│   │   ├── conftest.py             # Fixture TestClient
│   │   └── test_health.py          # Test de health check
│   ├── Dockerfile                  # python:3.12-slim + uvicorn
│   ├── docker-compose.yml          # Servicio backend
│   └── pyproject.toml              # Dependencias y config pytest
│
├── Frontend/
│   ├── src/
│   │   ├── api/                    # Cliente HTTP y funciones para cada endpoint
│   │   │   ├── client.ts           # Fetch centralizado (apiFetch)
│   │   │   ├── datasets.ts         # getHealth, uploadDataset, nlQuery, sqlQuery
│   │   │   └── types.ts            # Interfaces TypeScript para requests/responses
│   │   ├── components/
│   │   │   ├── chat/               # Componentes del asistente conversacional
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── ChatHistory.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatResultPreview.tsx
│   │   │   │   └── ChatSqlBlock.tsx
│   │   │   ├── DatasetSchemaViewer.tsx
│   │   │   ├── DatasetUploader.tsx
│   │   │   ├── GeneratedSqlViewer.tsx
│   │   │   ├── HealthStatus.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── NaturalLanguageQueryPanel.tsx
│   │   │   ├── ResultsTable.tsx
│   │   │   └── SqlQueryPanel.tsx
│   │   ├── hooks/
│   │   │   └── useDatasetChat.ts   # Hook para el estado del chat
│   │   ├── pages/
│   │   │   └── HomePage.tsx        # Página principal (única ruta)
│   │   ├── types/
│   │   │   └── chat.ts             # Tipos internos del chat
│   │   ├── App.tsx                 # Componente raíz
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Tailwind directives
│   ├── public/
│   │   └── favicon.svg
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── postcss.config.cjs          # PostCSS con @tailwindcss/postcss
│
└── README.md                       # Este archivo
```

---

## Comandos útiles

### Backend

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

### Frontend

```bash
cd Frontend

npm run dev       # Iniciar servidor de desarrollo (http://localhost:5173)
npm run build     # Compilar para producción (tsc + vite build)
npm run lint      # ESLint
npm run preview   # Previsualizar build de producción
```

---

## Notas para desarrollo

- **No comittees** `.env`. Usá `.env.example` como plantilla.
- **Backend**: los datasets subidos se almacenan en `Backend/app/storage/datasets/` (ya ignorado por `.gitignore`).
- **`MISTRAL_API_KEY`** es obligatoria para que funcione el endpoint NL-to-SQL.
- El proyecto **no usa base de datos externa ni migraciones**. La persistencia es sobre archivos SQLite subidos por el usuario.
- Si el frontend no se conecta al backend, verificá que `VITE_API_BASE_URL` apunte al puerto correcto y que el backend tenga CORS habilitado (variable `BACKEND_CORS_ORIGINS`).
- Agregá tests para cada nuevo endpoint del backend.
