# Reservaya - Frontend

Sistema de reservas de parrillas para edificios residenciales.

## Tecnologías

- React 18.3
- TypeScript
- Vite
- Tailwind CSS
- Radix UI

## Requisitos

- Node.js 18+
- npm o pnpm

## Instalación

```bash
npm install
```

## Configuración

Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` con la URL de tu backend:

```
VITE_API_URL=http://localhost:3000/api
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Estructura del proyecto

```
src/
├── api/           # Configuración base para llamadas HTTP
├── services/      # Servicios que consumen la API del backend
├── app/
│   ├── components/  # Componentes React
│   └── types.ts     # Interfaces TypeScript
└── styles/        # Estilos CSS
```

## Backend

Este frontend está diseñado para funcionar con un backend separado (reservaya-backend).
