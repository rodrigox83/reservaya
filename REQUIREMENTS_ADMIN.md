# Reservaya - Requerimientos de Administración y Recepción

Este documento contiene los requerimientos relacionados con las funcionalidades disponibles para el personal administrativo y recepcionistas del condominio.

---

## 1. Sistema de Autenticación del Personal

**Estado:** Completado

### 1.1 Flujo de Ingreso
1. Desde la pantalla inicial, seleccionar "Personal/Administrador"
2. Ingresar usuario y contraseña
3. El sistema valida credenciales y asigna rol correspondiente

### 1.2 Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Administrador con acceso completo | Todos los permisos |
| **RECEPTIONIST** | Recepcionista con acceso limitado | Sin permisos de aprobación |

### 1.3 Credenciales por Defecto

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Admin | `admin` | `reservaya2024` |
| Recepcionista | `recepcion` | `recepcion2024` |

---

## 2. Panel de Administración (Dashboard)

**Estado:** Completado

### 2.1 Estadísticas Generales
El dashboard muestra las siguientes métricas en tiempo real:

#### Sección: Personas
- Total de propietarios registrados
- Total de huéspedes registrados

#### Sección: Parrillas
- Total de parrillas
- Reservas pendientes
- Reservas aprobadas
- Reservas rechazadas
- Total de reservas

#### Sección: Piscina
- Ocupación actual (personas en la piscina)
- Capacidad máxima (25 personas)
- Indicador visual de ocupación (barra de progreso)
- Accesos del día

### 2.2 Indicadores Visuales
- Barra de progreso circular para ocupación de piscina
- Colores según nivel de ocupación:
  - Verde: 0-50% ocupación
  - Amarillo: 51-80% ocupación
  - Rojo: 81-100% ocupación

---

## 3. Gestión de Reservas de Parrillas

**Estado:** Completado

### 3.1 Vista de Solicitudes Pendientes
- Lista de todas las reservas con estado "Pendiente"
- Información mostrada:
  - Nombre del propietario
  - Departamento
  - Parrilla solicitada
  - Fecha de reserva
  - Fecha de solicitud

### 3.2 Acciones Disponibles (Solo ADMIN)
| Acción | Descripción |
|--------|-------------|
| **Aprobar** | Cambia estado a "Aprobada" |
| **Rechazar** | Cambia estado a "Rechazada" |

### 3.3 Restricciones por Rol
- **ADMIN:** Puede aprobar y rechazar reservas
- **RECEPTIONIST:** Solo puede visualizar, no puede aprobar/rechazar

---

## 4. Directorio de Propietarios

**Estado:** Completado

### 4.1 Lista de Propietarios
- Visualización de todos los propietarios registrados
- Información mostrada:
  - Nombre completo
  - Departamento
  - Email
  - Teléfono
  - Fecha de registro

### 4.2 Funcionalidades
- Búsqueda por nombre o departamento
- Ordenamiento por diferentes campos
- Exportación de datos (futuro)

---

## 5. Directorio de Huéspedes

**Estado:** Completado

### 5.1 Lista de Huéspedes
- Visualización de todos los huéspedes registrados
- Información mostrada:
  - Nombre completo
  - Tipo de documento y número
  - Tipo de huésped (Airbnb, Amigo, Inquilino)
  - Departamento asociado
  - Fecha de registro

### 5.2 Funcionalidades
- Búsqueda por nombre, documento o departamento
- Filtro por tipo de huésped
- Eliminación de huéspedes (con confirmación)

### 5.3 Badges de Tipo
| Tipo | Color |
|------|-------|
| Airbnb | Naranja |
| Amigo | Azul |
| Inquilino | Verde |

---

## 6. Control de Aforo de Piscina

**Estado:** Completado

### 6.1 Panel de Ocupación
- Lista de todas las personas actualmente en la piscina
- Información mostrada:
  - Nombre de la persona
  - Departamento
  - Hora de ingreso
  - Tiempo restante/excedido
  - Tipo (Propietario/Invitado)

### 6.2 Acciones Disponibles
| Acción | Descripción |
|--------|-------------|
| **Registrar salida** | Marca salida de cualquier persona |
| **Ver historial** | Accesos del día actual |

### 6.3 Estadísticas en Tiempo Real
- Ocupación actual vs capacidad máxima
- Propietarios activos en piscina
- Invitados activos en piscina
- Total de entradas del día

---

## 7. Despliegue y Configuración

**Estado:** Completado

### 7.1 Infraestructura Azure
| Componente | Servicio Azure |
|------------|----------------|
| Backend | Azure App Service (B1) |
| Frontend | Azure App Service |
| Base de datos | PostgreSQL Flexible Server |
| Imágenes Docker | GitHub Container Registry (GHCR) |

### 7.2 Variables de Entorno (Backend)
| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para tokens JWT |
| `FRONTEND_URL` | URL del frontend (CORS) |
| `NODE_ENV` | Entorno (production/development) |

### 7.3 CI/CD con GitHub Actions
- Workflows automáticos para despliegue
- Secrets requeridos:
  - `AZURE_CREDENTIALS`
  - `AZURE_WEBAPP_NAME_STG`
  - `AZURE_WEBAPP_NAME_PROD`
  - `DATABASE_URL_STG` (solo backend)
  - `DATABASE_URL_PROD` (solo backend)

---

## 8. Funcionalidades Futuras (Pendientes)

### 8.1 Gestión de Usuarios del Sistema
- Crear/editar/eliminar usuarios admin y recepcionistas
- Cambio de contraseñas
- Historial de acciones por usuario

### 8.2 Reportes y Estadísticas
- Reporte de uso de parrillas por período
- Reporte de ocupación de piscina
- Exportación a Excel/PDF

### 8.3 Configuración del Sistema
- Modificar capacidad máxima de piscina
- Configurar horarios de disponibilidad
- Gestionar número y nombres de parrillas

### 8.4 Notificaciones
- Alertas cuando la piscina alcanza cierta ocupación
- Notificaciones de nuevas solicitudes de reserva
- Recordatorios de reservas del día

---

## Historial de Cambios

| Fecha | Requerimiento | Estado |
|-------|---------------|--------|
| 2026-01-01 | Panel de administración básico | Completado |
| 2026-01-01 | Gestión de reservas (aprobar/rechazar) | Completado |
| 2026-01-01 | Directorio de propietarios | Completado |
| 2026-01-01 | Despliegue en Azure | Completado |
| 2026-01-01 | Control de aforo piscina | Completado |
| 2026-01-03 | Roles Admin/Recepcionista | Completado |
| 2026-01-03 | Login con usuario/contraseña | Completado |
| 2026-01-03 | Dashboard mejorado con secciones | Completado |
| 2026-01-03 | Directorio de huéspedes | Completado |