# SDD Specification: Requerimientos Funcionales y No Funcionales

## 1. Requerimientos Funcionales

### RF-01: Autenticación y Autorización
- Inicio de sesión con Email y Contraseña (`POST /admin/login`).
- Persistencia de sesión con Zustand y `localStorage`.
- Control de roles (`Admin` = 1, `PersonalTrainer` = 2).
- Cierre de sesión y protección de rutas privadas.

### RF-02: Control de Acceso (Molinete / Check-in)
- Campo numérico para ingreso de DNI y botón de validación inmediata (`POST /cliente/ingreso`).
- Respuesta con 3 estados visuales notorios:
  - **Permitido (Cuota al día):** Notificación verde, nombre del socio y fecha de vencimiento.
  - **Permitido con advertencia (En tolerancia):** Notificación amarilla/naranja informando fecha límite para abonar (hasta 5 días post vencimiento).
  - **Rechazado (Vencido o inexistente):** Notificación roja con motivo claro del rechazo.

### RF-03: Padrón y Directorio de Clientes
- Tabla de socios (`GET /cliente/lista-clientes`) mostrando:
  - Nombre completo, DNI, Email, Teléfono.
  - Plan contratado (Pase libre / 3 días, tipo y precio).
  - Fecha de último pago y fecha de vencimiento.
  - Badge de estado dinámico (Al Día, En Tolerancia, Vencido).
- Buscador en tiempo real por DNI o Nombre.
- Filtro por estado de cuota.

### RF-04: Alta de Nuevo Socio
- Modal / Formulario con validación Zod (`POST /cliente/registro`).
  - Nombre (obligatorio, máx 100 caracteres).
  - DNI (numérico entre 1.000.000 y 99.999.999).
  - Teléfono (obligatorio, máx 20 caracteres).
  - Email (formato válido de correo).
  - Plan (Pase Libre Mensual $35.000 o 3 Días Mensual $25.000).
  - Método de Pago (Efectivo = 1, Transferencia = 2).
- Actualización automática de la tabla tras el alta exitosa.

### RF-05: Renovación de Cuota
- Formulario modal (`POST /cliente/actualizar`) para renovar cuota:
  - DNI del cliente.
  - Selección de nuevo plan.
  - Selección de método de pago.
- Manejo del caso de negocio: solo permite renovar si la cuota anterior ya está vencida.

### RF-06: Gestión de Personal Trainers (Solo Admin)
- Panel exclusivo para Administrador (`POST /admin/registro-usuario`).
  - Nombre, Apellido, Email, Contraseña, Estado Activo.
- Verificación de permisos y bloqueo para rol Personal Trainer.

## 2. Requerimientos No Funcionales
- Tiempo de carga < 2s.
- TypeScript en modo estricto sin `any`.
- Arquitectura desacoplada en `core` y `presentation`.
- Estilo visual consistente con `admin-web` (Dark surface, contrastes accesibles).
