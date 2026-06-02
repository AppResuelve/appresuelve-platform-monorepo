# AppResuelve Platform

Monorepo que contiene el sistema de onboarding, admin dashboard y API de AppResuelve.

## Estructura

```
├── src/                          # Frontend unificado (Vite + React)
│   ├── admin/                    # Dashboard de administración
│   │   ├── pages/Dashboard.jsx
│   │   └── AdminApp.jsx
│   ├── onboarding/               # Formulario del cliente
│   │   ├── pages/OnboardingPage.jsx
│   │   └── OnboardingApp.jsx
│   ├── shared/                   # Componentes, hooks, utils compartidos
│   ├── App.jsx                   # Routing por subdominio con React.lazy
│   ├── main.jsx
│   └── index.css
│
├── api/                          # Backend Express
│   ├── src/
│   │   ├── config/cloudinary.js
│   │   ├── db/connection.js
│   │   ├── routes/
│   │   │   ├── admin.js
│   │   │   ├── clients.js
│   │   │   ├── documents.js
│   │   │   └── onboarding.js
│   │   └── services/
│   │       └── storage/          # Storage factory (Cloudinary | local)
│   ├── db/schema.sql
│   └── .env.example
│
├── packages/shared/              # Tipos, constantes, API client
├── index.html
├── vite.config.js
└── pnpm-workspace.yaml
```

## Subdominios

| Subdominio | Módulo | Descripción |
|---|---|---|
| `admin.appresuelve.site` | `src/admin/` | Dashboard de gestión de clientes |
| `onboarding.appresuelve.site` | `src/onboarding/` | Formulario de onboarding para clientes |
| `api.appresuelve.site` | `api/` | Backend Express |

La app detecta el subdominio por `window.location.hostname` y carga el módulo correspondiente con `React.lazy()`. Un solo deploy en Vercel para ambos.

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Frontend (puerto 5173)
pnpm dev

# API (puerto 3001)
pnpm dev:api

# Build
pnpm build
```

## Variables de entorno

Copiá los `.env.example` a `.env`:

- **Raíz**: `VITE_API_URL`, `VITE_ONBOARDING_URL`
- **API**: `DATABASE_URL`, `STORAGE_PROVIDER`, `CLOUDINARY_*`, `CORS_ORIGINS`

### Storage

El servicio de storage usa un factory pattern. Configurá `STORAGE_PROVIDER`:

- `local`: Archivos en disco (`uploads/`, para desarrollo)
- `cloudinary`: Cloudinary (producción). Requiere `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Deploy

- **Frontend**: Un solo proyecto en Vercel con custom domains para `admin.appresuelve.site` y `onboarding.appresuelve.site`
- **API**: Railway con custom domain `api.appresuelve.site`
