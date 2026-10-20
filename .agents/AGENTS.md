# Frontend y Diseño - Mejores Prácticas (Gestión Gimnasio Web)

- **Excelencia Visual y de UX:** Priorizar interfaces modernas, dinámicas y de alta calidad (dark mode por defecto con soporte dual, tokens de color oscuros/dorados/naranjas, micro-interacciones, tipografía sans legible).
- **Atención al Detalle:** Cada componente debe sentirse premium. Cuidar espaciados, bordes suaves, hover states y feedback visual inmediato (especialmente en control de acceso y pagos).
- **Enfoque Sistemático (Clean Architecture):**
  - `src/core`: Modelos, contratos DTO, clientes API puros con Axios. Sin acoplamiento a React.
  - `src/presentation`: Componentes, vistas, stores de Zustand, React Query hooks y router.
- **Backend - Solo lectura:**
  - El backend se ubica en `C:\Users\Juampi\source\repos\gestion-gimnasio`. Nunca modificar archivos del backend directamente. Todos los contratos y DTOs del frontend deben reflejar con exactitud la API del backend.
- **Data Fetching:** TanStack React Query v5 con keys estructuradas e invalidaciones precisas tras mutaciones.
- **Formularios:** React Hook Form + Zod resolver para validaciones tipadas y mensajes en español neutro / profesional.
- **Git y Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, etc.), sin atribución de IA, con push a `origin/main` según lo indicado por el usuario.
