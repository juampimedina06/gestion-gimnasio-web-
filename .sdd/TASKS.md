# SDD Tasks & Status Tracker

- [x] **Ticket 1:** `chore: setup project structure with vite react tailwind and router`
  - Scaffolding de Vite + React 18 + TS + Tailwind + Lucide + Router + Axios + TanStack Query + Zustand.
  - Setup de configuración de compilación y aliases `@/*`.

- [x] **Ticket 2:** `feat(core): domain interfaces enums and axios client`
  - Mapeo de enums del backend (`TipoRol`, `EstadoCliente`, `EstadoPago`, `MetodoPago`, etc.).
  - Definición de interfaces TypeScript para todos los DTOs.
  - Instancia de Axios configurada con base URL y manejo de errores.

- [x] **Ticket 3:** `feat(auth): login authentication flow and zustand store`
  - Implementación de `useAuthStore` con Zustand y persistencia.
  - Pantalla `LoginScreen` con validación Zod y conexión a `POST /admin/login`.
  - Componentes `ProtectedRoute` y guards de rol.

- [x] **Ticket 4:** `feat(ui): main dashboard layout sidebar and navigation`
  - `MainLayout` con Sidebar responsivo y navegación dinámica según rol.
  - Navbar con información del usuario autenticado y botón de Logout.

- [x] **Ticket 5:** `feat(ingreso): check-in access control screen with dni scanner`
  - Vista `ControlAccesoScreen` conectada a `POST /cliente/ingreso`.
  - Input para DNI con soporte de escaneo / Enter y tarjeta de respuesta en tiempo real (Verde / Naranja / Rojo).

- [x] **Ticket 6:** `feat(clientes): clients table list with payment status badges`
  - Vista `ClientesScreen` consumiendo `GET /cliente/lista-clientes` con React Query.
  - Buscador por DNI / Nombre, filtros por estado de cuota y badges de estado.

- [x] **Ticket 7:** `feat(clientes): new client registration modal with initial payment`
  - Modal `NuevoClienteModal` para `POST /cliente/registro`.
  - Formulario React Hook Form + Zod validando campos y vinculando plan inicial.

- [x] **Ticket 8:** `feat(pagos): payment renewal modal for expired memberships`
  - Modal `RenovarPagoModal` conectado a `POST /cliente/actualizar`.
  - Renovación de plan y método de pago con validación de estado previo.

- [ ] **Ticket 9:** `feat(usuarios): personal trainer management screen for admin`
  - Vista `PersonalTrainersScreen` protegida exclusivamente para `Admin`.
  - Formulario de alta para `POST /admin/registro-usuario`.

- [ ] **Ticket 10:** `feat(dashboard): analytics summary metrics and final verification`
  - `DashboardScreen` con estadísticas del gimnasio, accesos rápidos y estado del sistema.
  - Verificación final de build y tipado.
