# Reservaya - Requerimientos de Propietarios

Este documento contiene los requerimientos relacionados con las funcionalidades disponibles para los propietarios del condominio.

---

## 1. Sistema de Autenticación de Propietarios

**Estado:** Completado

### 1.1 Flujo de Ingreso
1. Pantalla inicial con dos opciones: "Soy Propietario" y "Personal/Administrador"
2. Si selecciona "Soy Propietario":
   - Primero debe seleccionar: Torre, Piso y Departamento
   - El sistema verifica si el departamento tiene propietario registrado
   - **Si el departamento TIENE propietario:** Se solicita el DNI para verificar identidad
   - **Si el departamento NO tiene propietario:** Se muestra formulario de registro

### 1.2 Registro de Propietarios
Campos obligatorios para nuevo propietario:
- Nombre y Apellido
- DNI (obligatorio)
- Email
- Teléfono

### 1.3 Identificación del Departamento
- Se genera automáticamente un código de departamento (ej: 101A)
- Formato: [Piso][Departamento][Torre]

---

## 2. Sistema de Reservas de Parrillas

**Estado:** Completado

### 2.1 Disponibilidad de Parrillas
- 8 parrillas disponibles en total:
  - 2 parrillas en Torre A
  - 6 parrillas en Torre B

### 2.2 Proceso de Reserva
- Calendario interactivo para selección de fecha
- Indicadores visuales de disponibilidad por fecha
- Visualización de parrillas en layout de dos columnas:
  - En móvil: 1 columna
  - En tablet/desktop: 2 columnas
- Botón "Solicitar ahora" ocupa todo el ancho de la tarjeta

### 2.3 Estados de Reserva
- **Pendiente:** Reserva enviada, esperando aprobación
- **Aprobada:** Reserva confirmada por administración
- **Rechazada:** Reserva no aprobada

### 2.4 Límite de Reservas
- Cada usuario solo puede tener **una reserva activa** (pendiente o aprobada con fecha futura) a la vez
- Se muestra mensaje de error al intentar crear una segunda reserva
- El mensaje indica la reserva activa existente
- No puede solicitar otra reserva hasta que:
  - Su reserva actual sea rechazada
  - La fecha de su reserva aprobada haya pasado

---

## 3. Módulo de Acceso a Piscina

**Estado:** Completado

### 3.1 Registro de Invitados
Los propietarios pueden registrar diferentes tipos de invitados:

| Tipo | Descripción |
|------|-------------|
| **Residente** | Personas que viven en el departamento junto con el propietario |
| **Amigo/Invitado** | Amigos o conocidos del propietario |
| **Inquilino** | Personas que alquilan el departamento |
| **Huésped Airbnb** | Huéspedes de alquiler temporal |

Datos requeridos para cada invitado:
- Nombre y apellido
- Número de documento (opcional)
- Tipo de invitado
- Asociación al departamento del propietario

### 3.2 Registro de Acceso a Piscina
- El propietario puede registrar su ingreso o el de sus invitados registrados
- Se indica el tiempo estimado de uso (1-4 horas)
- El sistema calcula automáticamente la hora esperada de salida
- Se verifica que la persona no tenga ya un acceso activo

### 3.3 Control de Aforo (Vista del Propietario)
- Indicador visual del nivel de ocupación actual
- Barra de progreso mostrando porcentaje de ocupación:
  - Verde: Baja ocupación
  - Amarillo: Ocupación media
  - Rojo: Alta ocupación
- Bloqueo de nuevos ingresos cuando se alcanza capacidad máxima (25 personas)

### 3.4 Panel de Ocupación Personal
- Lista de personas de su departamento actualmente en la piscina
- Indicador de tiempo restante o excedido
- Botón para registrar salida (propia o de sus invitados)

---

## 4. Funcionalidades Futuras (Pendientes)

*Esta sección se actualizará con nuevos requerimientos para propietarios.*

---

## Historial de Cambios

| Fecha | Requerimiento | Estado |
|-------|---------------|--------|
| 2026-01-01 | Sistema de autenticación propietarios | Completado |
| 2026-01-01 | Sistema de reservas de parrillas | Completado |
| 2026-01-01 | Parrillas en dos columnas | Completado |
| 2026-01-01 | Límite una reserva por usuario | Completado |
| 2026-01-01 | Módulo de acceso a piscina | Completado |
| 2026-01-03 | Flujo de login propietario mejorado | Completado |