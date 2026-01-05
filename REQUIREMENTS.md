# Reservaya - Documentación de Requerimientos

Este documento sirve como índice principal de los requerimientos del sistema de reservas de parrillas y control de acceso a áreas comunes.

---

## Documentos de Requerimientos

Los requerimientos están organizados por tipo de usuario:

| Documento | Descripción |
|-----------|-------------|
| [REQUIREMENTS_PROPIETARIOS.md](REQUIREMENTS_PROPIETARIOS.md) | Funcionalidades para propietarios del condominio |
| [REQUIREMENTS_HUESPEDES.md](REQUIREMENTS_HUESPEDES.md) | Funcionalidades para huéspedes e invitados |
| [REQUIREMENTS_ADMIN.md](REQUIREMENTS_ADMIN.md) | Funcionalidades para administración y recepción |

---

## Resumen del Sistema

### Usuarios del Sistema

| Tipo de Usuario | Acceso | Documento |
|-----------------|--------|-----------|
| Propietario | App móvil/web | [Propietarios](REQUIREMENTS_PROPIETARIOS.md) |
| Huésped/Invitado | A través del propietario | [Huéspedes](REQUIREMENTS_HUESPEDES.md) |
| Administrador | Panel de administración | [Admin](REQUIREMENTS_ADMIN.md) |
| Recepcionista | Panel de administración (limitado) | [Admin](REQUIREMENTS_ADMIN.md) |

### Módulos Principales

1. **Autenticación**
   - Login de propietarios por departamento + DNI
   - Login de personal con usuario/contraseña

2. **Reservas de Parrillas**
   - 8 parrillas (2 Torre A, 6 Torre B)
   - Límite de 1 reserva activa por propietario

3. **Control de Piscina**
   - Aforo máximo: 25 personas
   - Registro de ingreso/salida
   - Control en tiempo real

4. **Panel de Administración**
   - Dashboard con estadísticas
   - Gestión de reservas
   - Directorios de propietarios y huéspedes

---

## Arquitectura Técnica

| Componente | Tecnología |
|------------|------------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + Prisma |
| Base de datos | PostgreSQL |
| Despliegue | Azure App Service |
| CI/CD | GitHub Actions |

---

## Estado General

| Módulo | Estado |
|--------|--------|
| Autenticación propietarios | Completado |
| Autenticación personal | Completado |
| Reservas de parrillas | Completado |
| Control de piscina | Completado |
| Panel de administración | Completado |
| Directorio de huéspedes | Completado |
| Despliegue Azure | Completado |

---

## Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| 2026-01-04 | Reorganización en 3 documentos separados |
| 2026-01-03 | Roles de personal, flujo de login mejorado |
| 2026-01-01 | Versión inicial del sistema |