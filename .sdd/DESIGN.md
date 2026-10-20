# SDD Design: Arquitectura Técnica y Modelo de Datos

## 1. Estructura de Capas (Clean Architecture)

```
src/
├── core/                           # Capa de Dominio e Infraestructura de Datos
│   ├── api/
│   │   └── axiosClient.ts          # Configuración base, interceptor para token/headers y normalización de errores
│   ├── auth/
│   │   ├── auth.api.ts             # adminLogin
│   │   └── models/auth.types.ts    # LoginDTO, LoginRespuestaDTO, UserSession
│   ├── clientes/
│   │   ├── clientes.api.ts         # fetchClientes, registrarCliente, registrarIngreso, renovarPago
│   │   └── models/cliente.types.ts # ListaClientesDTO, RegistrarClienteDTO, etc.
│   ├── usuarios/
│   │   ├── usuarios.api.ts         # registrarUsuario
│   │   └── models/usuario.types.ts # UsuarioDTO
│   └── shared/
│       └── enums.ts                # TipoRol, EstadoCliente, EstadoPago, MetodoPago, PlanPase, etc.
│
└── presentation/                   # Capa de Presentación (React / UI)
    ├── components/                 # Componentes atómicos (Button, Input, Modal, Badge, Card, StatCard)
    ├── layout/                     # MainLayout (Sidebar + Navbar + Container)
    ├── router/                     # AppRouter, ProtectedRoute, RoleGuard
    ├── store/                      # useAuthStore (Zustand + persist)
    ├── hooks/                      # useClientes, useIngreso, useAuth, useUsuarios
    ├── screens/
    │   ├── auth/LoginScreen.tsx
    │   ├── dashboard/DashboardScreen.tsx
    │   ├── ingreso/ControlAccesoScreen.tsx
    │   ├── clientes/ClientesScreen.tsx
    │   └── usuarios/PersonalTrainersScreen.tsx
    └── utils/
        ├── cn.ts                   # clsx + tailwind-merge
        └── formatters.ts           # Formateo de fechas (dd/MM/yyyy) y precios ($)
```

## 2. Contratos y Tipos Principales

```typescript
export enum TipoRol {
  Admin = 1,
  PersonalTrainer = 2,
}

export enum EstadoCliente {
  Activo = 1,
  Inactivo = 2,
  Baja = 3,
}

export enum EstadoPago {
  AlDia = 1,
  Vencido = 2,
  EnTolerancia = 3,
}

export enum MetodoPago {
  Efectivo = 1,
  Transferencia = 2,
}
```
