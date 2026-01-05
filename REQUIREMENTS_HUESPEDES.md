# Reservaya - Requerimientos de Huéspedes e Invitados

Este documento contiene los requerimientos relacionados con las funcionalidades disponibles para huéspedes e invitados del condominio.

---

## 1. Tipos de Huéspedes/Invitados

El sistema reconoce los siguientes tipos de personas que no son propietarios:

| Tipo | Descripción | Registrado por |
|------|-------------|----------------|
| **Residente** | Familiares o personas que viven permanentemente con el propietario | Propietario |
| **Amigo/Invitado** | Visitas temporales del propietario | Propietario |
| **Inquilino** | Personas que alquilan el departamento | Propietario |
| **Huésped Airbnb** | Huéspedes de alquiler temporal tipo Airbnb | Propietario |

---

## 2. Registro de Huéspedes

**Estado:** Completado

### 2.1 Proceso de Registro
- Los huéspedes son registrados por el propietario del departamento
- El registro queda asociado al departamento del propietario

### 2.2 Datos del Huésped
| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre | Sí | Nombre del huésped |
| Apellido | Sí | Apellido del huésped |
| Tipo de documento | Sí | DNI, Pasaporte, CE, Otro |
| Número de documento | Sí | Número del documento de identidad |
| Email | No | Correo electrónico |
| Teléfono | No | Número de contacto |
| Tipo de huésped | Sí | Airbnb, Amigo, Inquilino |

---

## 3. Acceso a Áreas Comunes

**Estado:** Completado

### 3.1 Acceso a Piscina
- Los huéspedes pueden acceder a la piscina si:
  - Están previamente registrados por un propietario
  - El propietario registra su ingreso
  - No hay exceso de aforo (máximo 25 personas)
  - No tienen un acceso activo actualmente

### 3.2 Control de Tiempo
- Se registra tiempo estimado de uso (1-4 horas)
- Sistema calcula hora esperada de salida
- Indicador visual de tiempo restante/excedido

### 3.3 Registro de Salida
- La salida puede ser registrada por:
  - El propietario que registró el ingreso
  - Personal de administración/recepción

---

## 4. Restricciones para Huéspedes

### 4.1 Acceso Limitado
- Los huéspedes **NO pueden**:
  - Registrarse por sí mismos en el sistema
  - Acceder directamente a la aplicación
  - Reservar parrillas independientemente
  - Registrar ingreso/salida de piscina por cuenta propia

### 4.2 Dependencia del Propietario
- Todas las acciones de huéspedes dependen del propietario:
  - Registro inicial en el sistema
  - Registro de ingreso a áreas comunes
  - Registro de salida de áreas comunes

---

## 5. Funcionalidades Futuras (Pendientes)

### 5.1 Acceso Directo para Huéspedes (Propuesto)
- Posibilidad de que huéspedes accedan con código temporal
- Código generado por el propietario con vigencia limitada

### 5.2 Reservas por Inquilinos (Propuesto)
- Permitir que inquilinos registrados puedan reservar parrillas
- Requiere autorización previa del propietario

### 5.3 Notificaciones (Propuesto)
- Envío de email/SMS al huésped cuando es registrado
- Recordatorios de tiempo en piscina

---

## Historial de Cambios

| Fecha | Requerimiento | Estado |
|-------|---------------|--------|
| 2026-01-01 | Registro de invitados por propietario | Completado |
| 2026-01-01 | Tipos de huéspedes (Airbnb, Amigo, Inquilino) | Completado |
| 2026-01-01 | Acceso a piscina para huéspedes | Completado |
| 2026-01-03 | Registro de huéspedes mejorado | Completado |