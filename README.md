# Task Manager — Frontend

SPA Angular 18 para la gestión de tareas. Construida con **standalone components**, **Angular Signals**, **RxJS** y **Arquitectura Hexagonal** aplicada al frontend.

---

## Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Instalación](#instalación)
3. [Scripts](#scripts)
4. [Funcionalidades](#funcionalidades)
5. [Arquitectura](#arquitectura)
6. [Componentes](#componentes)
7. [Estructura de Carpetas](#estructura-de-carpetas)
8. [Design System](#design-system)

---

## Requisitos

- **Node.js 20+ LTS**
- **npm 9+**
- **Task Manager API** corriendo en `http://localhost:3000`

---

## Instalación

```bash
# 1. Entrar al directorio
cd Task_periferia_front

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm start
```

La aplicación queda disponible en:

```
http://localhost:4200
```

> El backend debe estar corriendo antes de abrir la aplicación.

---

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm start` | Servidor de desarrollo (`ng serve`) en `http://localhost:4200` |
| `npm run build` | Genera el bundle de producción en `dist/` |
| `npm run watch` | Build en modo watch |
| `npm test` | Tests unitarios con Karma |

---

## Funcionalidades

| Funcionalidad | Descripción |
|--------------|-------------|
| **Listar tareas** | Grid de 3 columnas con cards de altura uniforme (2 en tablet, 1 en móvil) |
| **Infinite scroll** | Al llegar al fondo del listado, se carga la siguiente página (9 tareas) con un indicador de carga y delay de 3 segundos |
| **Filtrar por estado** | Barra de tabs: Todos / Pendientes / En progreso / Completadas — filtrado reactivo sin peticiones adicionales al servidor |
| **Buscar tareas** | Campo de búsqueda con debounce de 300ms sobre las tareas ya cargadas |
| **Crear tarea** | Modal con formulario reactivo, validaciones inline y limpieza automática al abrir |
| **Editar tarea** | El mismo modal pre-poblado con los datos de la tarea seleccionada |
| **Eliminar tarea** | Modal de confirmación antes de ejecutar la eliminación |
| **Skeleton loader** | 9 cards con animación shimmer durante los primeros 5 segundos de la carga inicial |
| **Indicador de paginación** | Spinner con texto "Cargando más tareas..." durante cada carga adicional |
| **Contadores reactivos** | Total, Pendientes, En progreso y Completadas actualizados automáticamente con computed signals |
| **Toast notifications** | Mensajes de éxito y error con cierre automático tras 3 segundos |
| **Estado vacío** | Mensaje contextual cuando no hay tareas o el filtro activo no produce resultados |
| **Responsive** | Grid fluido: 3 columnas (≥900px) → 2 columnas (≥560px) → 1 columna |

---

## Arquitectura

El frontend aplica **Arquitectura Hexagonal**, separando el dominio de negocio, la lógica de aplicación, la infraestructura HTTP y la presentación visual.

### Principio de Dependencias

```
presentation  →  application (facade)  →  ports (interfaces)
infrastructure                          →  ports (implementa)
domain                                  →  nada externo
```

Los componentes de UI nunca llaman directamente a `HttpClient`. Solo acceden al `TaskFacade`. El `TaskFacade` depende de la interfaz `TaskRepositoryPort`, no de la implementación HTTP concreta.

### Las Cuatro Capas

**1. Domain** (`src/app/domain/`)

Contiene los modelos e interfaces de la aplicación. Sin dependencias de Angular.

- `task.model.ts` — interfaces `Task`, `CreateTaskPayload` y `UpdateTaskPayload`.
- `task-status.enum.ts` — enum `TaskStatus` con las etiquetas en español para la UI.

**2. Application** (`src/app/application/`)

Define los contratos y orquesta la lógica.

- `task-repository.port.ts` — interfaz `TaskRepositoryPort` e `InjectionToken`. Define qué operaciones necesita la app sin saber cómo se implementan. También define el tipo `PagedTaskResult` para las respuestas paginadas.
- `task.facade.ts` — servicio central de la aplicación. Gestiona el estado con signals, expone valores derivados con `computed()`, y ejecuta las operaciones CRUD delegando al repositorio. Es el único punto de acceso al estado para todos los componentes.

**3. Infrastructure** (`src/app/infrastructure/`)

Implementación concreta del puerto de datos.

- `task-http.repository.ts` — implementa `TaskRepositoryPort` usando `HttpClient`. Es el único archivo que conoce la URL de la API y los parámetros HTTP. Usa `HttpParams` para construir las queries de paginación.

**4. Presentation** (`src/app/presentation/`)

Componentes de UI standalone. Reciben datos a través de `input()` y comunican acciones hacia arriba con `output()`. Ningún componente inyecta `HttpClient` ni accede a la URL de la API.

### Estado Reactivo — Signals vs RxJS

| Mecanismo | Cuándo se usa |
|-----------|---------------|
| **Signals** | Estado de la lista de tareas, filtro activo, búsqueda, loading, hasMore, contadores |
| **computed()** | `filteredTasks` (combina búsqueda + filtro de estado), contadores por estado |
| **RxJS Observables** | Peticiones HTTP (`HttpClient`), debounce de 300ms en la búsqueda, delay de skeleton |
| **effect()** | Sincronización entre señales (detectar fin de carga inicial para verificar si hace falta paginar) |

### Flujo — Carga Inicial con Skeleton Loader

```
ngOnInit()
  → facade.loadTasks()
    → loadingSignal = true       (task-list muestra 9 skeleton cards)
    → taskRepository.findPaginated(1, 9).pipe(delay(5000))
    → API REST: GET /tasks?page=1&limit=9
    → tasksSignal = data         (9 cards reales reemplazan el skeleton)
    → loadingSignal = false
    → effect detecta fin de carga → checkInitialFit()
      (si el contenido cabe en el viewport sin scroll → carga página 2)
```

### Flujo — Infinite Scroll

```
Usuario scrollea hacia el fondo
  → onWindowScroll() detecta: scrollY + windowH ≥ docH - 280px
    → facade.loadMoreTasks()
      → loadingMoreSignal = true  (aparece spinner "Cargando más tareas...")
      → taskRepository.findPaginated(nextPage, 9).pipe(delay(3000))
      → API REST: GET /tasks?page=N&limit=9
      → tasksSignal.update(existing → [...existing, ...newData])
      → loadingMoreSignal = false
      → hasMoreSignal = result.hasMore
```

### Flujo — Crear Tarea

```
Usuario → "+ Nueva tarea"
  → tasks.component: formOpen.set(true), editingTask.set(null)
  → task-form-modal: effect detecta open()=true → form.reset()
  → Usuario completa el formulario y hace submit
  → task-form-modal emite (saved) con CreateTaskPayload
  → tasks.component → facade.createTask(payload)
  → taskRepository.create(payload) → POST /tasks
  → tasksSignal.update([newTask, ...tasks])
  → notificationService.success() → toast 3 segundos
```

---

## Componentes

### Árbol

```
app-root
├── app-star-field              → Canvas con partículas animadas (fondo global, fuera de NgZone)
├── router-outlet               → Carga tasks.component lazy
└── app-toast-notification      → Host global de notificaciones

tasks.component (página principal — inyecta TaskFacade)
├── app-stats-counter           → 4 contadores numéricos (computed signals)
├── app-status-filter-bar       → Tabs de filtro por estado
├── app-search-bar              → Input con debounce 300ms
├── app-task-list               → Grid con skeleton / cards / estado vacío + infinite scroll
│   └── app-task-item           → Card individual glassmorphism + acciones
│       └── app-task-status-badge → Badge presentacional del estado
├── app-task-form-modal         → Modal crear / editar (ReactiveForm)
└── app-confirm-modal           → Confirmación antes de eliminar
```

### Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `app-star-field` | Canvas 80 partículas conectadas por líneas. Corre con `NgZone.runOutsideAngular()` para no interferir con el change detection de Angular. |
| `app-tasks` | Contenedor principal. Inyecta `TaskFacade`. Coordina los modales y delega todas las operaciones al facade. |
| `app-stats-counter` | Recibe 4 valores numéricos vía `input()`. Sin lógica de estado. |
| `app-status-filter-bar` | Tabs de filtro. Emite `filterChange` con el estado seleccionado. |
| `app-search-bar` | Campo de búsqueda. Aplica debounce 300ms con RxJS. Emite `queryChange`. |
| `app-task-list` | Grid 3-2-1 columnas. Muestra skeleton si `loading=true`, cards si hay tareas, mensaje vacío si no. Gestiona el window scroll para infinite scroll. |
| `app-task-item` | Card de altura fija (280px). Muestra badge de estado, título, descripción y acciones. Emite `edit` y `delete`. |
| `app-task-status-badge` | Badge visual. Solo recibe `status`. Sin lógica. |
| `app-task-form-modal` | Modal con `ReactiveForm`. Validaciones inline. Se auto-limpia al abrirse con `effect()`. |
| `app-confirm-modal` | Modal genérico. Recibe `title`, `message`, `confirmLabel`. Emite `confirmed` o `cancelled`. |
| `app-toast-notification` | Muestra hasta 5 toasts simultáneos. Auto-dismiss en 3 segundos con animación de salida. |

---

## Estructura de Carpetas

```
Task_periferia_front/
├── src/
│   ├── app/
│   │   ├── domain/                          # Sin dependencias de Angular ni librerías externas
│   │   │   ├── models/
│   │   │   │   └── task.model.ts            # Interfaces Task, CreateTaskPayload, UpdateTaskPayload
│   │   │   └── enums/
│   │   │       └── task-status.enum.ts      # enum TaskStatus + TASK_STATUS_LABELS (etiquetas ES)
│   │   │
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── task-repository.port.ts  # InjectionToken TASK_REPOSITORY + interfaz + PagedTaskResult
│   │   │   └── use-cases/
│   │   │       └── task.facade.ts           # Estado central: signals, computed, CRUD, paginación
│   │   │
│   │   ├── infrastructure/
│   │   │   └── repositories/
│   │   │       └── task-http.repository.ts  # Implementa TaskRepositoryPort con HttpClient
│   │   │
│   │   ├── presentation/
│   │   │   ├── pages/
│   │   │   │   └── tasks/
│   │   │   │       ├── tasks.component.ts   # Página principal, inyecta facade, coordina eventos
│   │   │   │       ├── tasks.component.html # Template: header, stats, filtros, grid, modales
│   │   │   │       └── tasks.component.scss # Layout page, navbar sticky glassmorphism
│   │   │   └── components/
│   │   │       ├── star-field/              # Canvas de partículas — fondo animado global
│   │   │       ├── task-list/               # Grid 3-2-1 cols, skeleton loader, infinite scroll
│   │   │       ├── task-item/               # Card glassmorphism 280px de altura
│   │   │       ├── task-form-modal/         # Modal crear/editar con ReactiveForm y validaciones
│   │   │       ├── task-status-badge/       # Badge presentacional del estado
│   │   │       ├── status-filter-bar/       # Tabs Todos/Pendientes/En progreso/Completadas
│   │   │       ├── stats-counter/           # 4 contadores por estado
│   │   │       ├── search-bar/              # Input con debounce 300ms
│   │   │       ├── confirm-modal/           # Modal de confirmación genérico (eliminar)
│   │   │       ├── loading-spinner/         # Spinner de carga (uso opcional)
│   │   │       └── toast-notification/      # Toasts de éxito y error con auto-dismiss
│   │   │
│   │   ├── shared/
│   │   │   └── services/
│   │   │       └── notification.service.ts  # Signal con cola de toasts, push/dismiss
│   │   │
│   │   ├── app.component.ts                 # Raíz: star-field + router-outlet + toast host
│   │   ├── app.config.ts                    # provideHttpClient, provideRouter, TASK_REPOSITORY DI
│   │   └── app.routes.ts                    # Ruta lazy: '' → TasksComponent
│   │
│   ├── environments/
│   │   └── environment.ts                   # { apiUrl: 'http://localhost:3000' }
│   │
│   ├── styles/
│   │   ├── _variables.scss                  # CSS Custom Properties (tokens de color, tipografía, sombras)
│   │   ├── _reset.scss                      # Normalización de box-model y márgenes
│   │   ├── _typography.scss                 # Fuente base, text-rendering, clases de texto
│   │   ├── _animations.scss                 # Keyframes globales: fade-in, fade-in-up, slide-up
│   │   └── styles.scss                      # Importa partials y define el fondo degradado global
│   │
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Design System

El sistema de diseño está definido en `src/styles/_variables.scss` mediante **CSS Custom Properties**. Todos los componentes consumen estos tokens — ningún valor de color, sombra o radio está hardcodeado en los estilos de componente.

### Tokens Principales

```scss
:root {
  /* Fondos */
  --bg-primary:  #07070e;
  --bg-card:     rgba(18, 16, 32, 0.70);   /* glassmorphism */
  --bg-nav:      rgba(15, 13, 26, 0.85);   /* navbar sticky */

  /* Acento */
  --accent:       #7c3aed;
  --accent-hover: #6d28d9;
  --accent-glow:  rgba(124, 58, 237, 0.30);

  /* Estados semánticos */
  --status-pending:     #6b7280;
  --status-in-progress: #f59e0b;
  --status-done:        #10b981;

  /* Texto */
  --text-primary:   #ffffff;
  --text-secondary: #c8d4e6;
  --text-muted:     #a5bddf;

  /* Radios */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Glassmorphism */
  --blur-nav:  blur(12px);
  --blur-card: blur(16px);
}
```

### Tipografía

- **Fuente**: `Inter` → `system-ui` (fallback)
- **Tamaño base**: `14px`
- **Pesos**: 400 (body), 500 (labels), 600 (títulos y botones)
- Sin serifa. `text-rendering: optimizeLegibility`.

### Animaciones

| Animación | Uso |
|-----------|-----|
| `fade-in-up` | Cards al aparecer, modales |
| `shimmer` | Efecto de barrido en skeleton cards |
| `ring-spin` | Spinner del indicador "Cargando más" |
| `slide-up` + `slide-out` | Entrada y salida de toasts |
| `requestAnimationFrame` | Partículas del canvas (fuera de NgZone) |
