# Reservaya - Documentación de Requerimientos

Este documento contiene todos los requerimientos solicitados para el sistema de reservas de parrillas.

---

## Requerimientos Implementados

### 1. Sistema de Autenticación de Propietarios
- Los propietarios ingresan seleccionando torre, piso y departamento
- Se genera automáticamente un código de departamento (ej: 101A)
- Registro de propietarios con nombre, email y teléfono

### 2. Sistema de Reservas de Parrillas
- 8 parrillas disponibles (2 en Torre A, 6 en Torre B)
- Calendario interactivo para selección de fecha
- Estados de reserva: pendiente, aprobada, rechazada
- Indicadores visuales de disponibilidad por fecha

### 3. Panel de Administración
- Dashboard con estadísticas generales
- Vista de solicitudes pendientes con acciones aprobar/rechazar
- Directorio de propietarios registrados con búsqueda

### 4. Despliegue en Azure
- Backend desplegado en Azure App Service (B1)
- Frontend desplegado en Azure App Service
- Base de datos PostgreSQL Flexible Server
- Imágenes Docker en GitHub Container Registry (GHCR)

### 5. Sistema de Autenticación

#### 5.1 Autenticación de Propietarios
**Estado:** Completado
**Descripción:** Flujo de login para propietarios basado en selección de departamento y verificación de DNI.

**Flujo de ingreso:**
1. Pantalla inicial con dos opciones: "Soy Propietario" y "Personal/Administrador"
2. Si selecciona "Soy Propietario":
   - Primero debe seleccionar: Torre, Piso y Departamento
   - El sistema verifica si el departamento tiene propietario registrado
   - **Si el departamento TIENE propietario:** Se solicita el DNI para verificar identidad
   - **Si el departamento NO tiene propietario:** Se muestra formulario de registro con campos obligatorios:
     - Nombre y Apellido
     - DNI (obligatorio)
     - Email
     - Teléfono

#### 5.2 Autenticación de Personal (Admin/Recepcionista)
**Estado:** Completado
**Descripción:** El acceso al panel de administración requiere usuario y contraseña.
- Formulario de login específico para personal con usuario/contraseña
- Dos roles disponibles:
  - **ADMIN**: Acceso completo incluyendo aprobación/rechazo de reservas
  - **RECEPTIONIST**: Acceso sin permisos de aprobación de reservas
- Credenciales por defecto:
  - Admin: usuario `admin`, contraseña `reservaya2024`
  - Recepcionista: usuario `recepcion`, contraseña `recepcion2024`

### 6. Visualización de Parrillas en Dos Columnas
**Estado:** Completado
**Descripción:** Las parrillas se muestran en un layout de dos columnas (grid responsive).
- En móvil: 1 columna
- En tablet/desktop: 2 columnas
- Botón de solicitar ahora ocupa todo el ancho de la tarjeta

### 7. Límite de Una Reserva Activa por Usuario
**Estado:** Completado
**Descripción:** Cada usuario solo puede tener una reserva activa (pendiente o aprobada con fecha futura) a la vez.
- Se muestra un mensaje de error al intentar crear una segunda reserva
- El mensaje indica la reserva activa existente
- No puede solicitar otra reserva hasta que:
  - Su reserva actual sea rechazada
  - La fecha de su reserva aprobada haya pasado

### 8. Módulo de Acceso a Piscina con Control de Aforo
**Estado:** Completado
**Descripción:** Sistema completo para gestionar el acceso a la piscina con control de aforo en tiempo real.

#### 8.1 Registro de Invitados
Los propietarios pueden registrar diferentes tipos de invitados:
- **Residente**: Personas que viven en el departamento junto con el propietario
- **Amigo/Invitado**: Amigos o conocidos del propietario
- **Inquilino**: Personas que alquilan el departamento
- **Huésped Airbnb**: Huéspedes de alquiler temporal

Cada invitado se registra con:
- Nombre y apellido
- Número de documento (opcional)
- Tipo de invitado
- Asociación al departamento del propietario

#### 8.2 Registro de Acceso a Piscina
- El propietario puede registrar su ingreso o el de sus invitados
- Se indica el tiempo estimado de uso (1-4 horas)
- El sistema calcula automáticamente la hora esperada de salida
- Se verifica que la persona no tenga ya un acceso activo

#### 8.3 Control de Aforo
- Capacidad máxima configurada: 25 personas
- Indicador visual del nivel de ocupación (verde, amarillo, rojo)
- Barra de progreso que muestra el porcentaje de ocupación
- Bloqueo de nuevos ingresos cuando se alcanza el 100%
- Estadísticas en tiempo real:
  - Ocupación actual
  - Propietarios activos
  - Invitados activos
  - Entradas del día

#### 8.4 Panel de Ocupación
- Lista de todas las personas actualmente en la piscina
- Indicador de tiempo restante o excedido
- Botón para registrar salida (propio o de invitados)
- El admin puede registrar la salida de cualquier persona

---

## Historial de Cambios

| Fecha | Requerimiento | Estado |
|-------|---------------|--------|
| 2026-01-01 | Sistema de autenticación propietarios | Completado |
| 2026-01-01 | Sistema de reservas | Completado |
| 2026-01-01 | Panel de administración | Completado |
| 2026-01-01 | Despliegue Azure | Completado |
| 2026-01-01 | Login admin con usuario/contraseña | Completado |
| 2026-01-01 | Parrillas en dos columnas | Completado |
| 2026-01-01 | Límite una reserva por usuario | Completado |
| 2026-01-01 | Módulo de acceso a piscina | Completado |
| 2026-01-03 | Roles de personal (Admin/Recepcionista) | Completado |
| 2026-01-03 | Flujo de login propietario mejorado | Completado |
