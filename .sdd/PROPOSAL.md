# SDD Proposal: Frontend Web para Gestión Gimnasio

## 1. Problem Statement
Se requiere un sistema web de gestión de gimnasio moderno, intuitivo y responsivo para interactuar con la API REST desarrollada en ASP.NET Core (.NET 10). La aplicación debe permitir el control de acceso de socios mediante DNI, administración de cuotas y pagos, gestión del padrón de clientes y administración de personal trainers por parte de usuarios administradores.

## 2. Proposed Architecture & Solution
- **Arquitectura:** Clean Architecture adaptada al frontend (patrón `core` vs `presentation` idéntico a `admin-web`).
- **Stack Tecnológico:**
  - Runtime & Bundler: Vite + React 18 / TypeScript
  - Estilos: Tailwind CSS con tema oscuro por defecto y variables de diseño
  - Manejo de Estado: Zustand (auth, ui)
  - Data Fetching & Cache: TanStack React Query v5
  - Formularios y Validación: React Hook Form + Zod
  - Iconografía: Lucide React
  - Cliente HTTP: Axios con interceptor y manejo centralizado de errores

## 3. Endpoints Integrados
1. `POST /admin/login` -> Autenticación de Admin y Personal Trainer.
2. `POST /admin/registro-usuario` -> Alta de Personal Trainer.
3. `GET /cliente/lista-clientes` -> Listado de clientes activos con su último pago y plan.
4. `POST /cliente/registro` -> Registro de nuevo socio con plan y pago inicial obligatorio.
5. `POST /cliente/ingreso` -> Control de acceso por DNI con cálculo de tolerancia y estados visuales.
6. `POST /cliente/actualizar` -> Renovación de cuota una vez vencida.
