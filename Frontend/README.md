# Consultor de BD con Lenguaje Natural – Frontend

Interfaz React + Vite + TypeScript para consultar bases SQLite mediante lenguaje natural, SQL y chat tipo asistente sobre un backend FastAPI.

Ver `../README.md` para instrucciones completas del proyecto.

---

## Requisitos

- Node.js >= 18
- npm

## Instalación

```bash
cd Frontend
npm install
```

## Configuración

```bash
cp .env.example .env
```

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | URL base del backend FastAPI |

## Desarrollo

```bash
npm run dev        # Servidor de desarrollo en http://localhost:5173
npm run build      # Compilar para producción
npm run lint       # ESLint
npm run preview    # Previsualizar build de producción
```

## Estructura

```
src/
├── api/            # Cliente HTTP y funciones API
├── components/     # Componentes React (chat, consulta NL, SQL manual, etc.)
├── hooks/          # Hooks personalizados (useDatasetChat)
├── pages/          # Páginas (HomePage)
└── types/          # Tipos internos (chat)
```
