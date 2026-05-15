# SQLite NL-to-SQL Assistant – Frontend

Interfaz React para consultar bases SQLite mediante lenguaje natural, SQL y chat tipo asistente sobre un backend FastAPI.

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` basado en `.env.example` con la URL base de la API:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Ejecución en desarrollo

```bash
npm run dev
```

El frontend estará disponible en http://localhost:5173

## Compilación

```bash
npm run build
```

## Lint (opcional)

```bash
npm run lint
```

## Conexión con el backend

El backend FastAPI debe estar escuchando en el puerto especificado por `VITE_API_BASE_URL` (por defecto `http://localhost:8000`).
Debes poder subir archivos SQLite, lanzar preguntas en lenguaje natural y ver resultados.

## Chat NL-to-SQL conversacional

La pestaña o panel "Chat" permite conversar con el dataset activo usando lenguaje natural. Cada pregunta envía una consulta NL-to-SQL y muestra la SQL generada y los resultados en una interfaz tipo asistente.
- Permite limpiar el chat, copiar SQL y reintentar mensajes con error.
- Si cambias de dataset, el chat se reinicia.
