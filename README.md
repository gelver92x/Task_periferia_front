# Gestor de Tareas — Frontend

SPA Angular 18 para gestión de tareas que consume la **Task Manager API**, construida con **standalone components**, **Signals**, **RxJS** y **Arquitectura Hexagonal** aplicada al frontend.

El diseño visual está inspirado en **Discomaps** — fondo animado de partículas conectadas, cards glassmorphism en grid de 3 columnas, paleta violeta/cian y filtrado por estado tipo tab bar.

---

## Tabla de Contenidos

1. [Stack Técnico](#stack-técnico)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Scripts Disponibles](#scripts-disponibles)
5. [Funcionalidades](#funcionalidades)
6. [Arquitectura](#arquitectura)
7. [Componentes](#componentes)
8. [Design System](#design-system)
9. [Estructura de Carpetas](#estructura-de-carpetas)
10. [Decisiones de Diseño](#decisiones-de-diseño)

---

## Stack Técnico

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| Framework | Angular | ^18.1 | SPA con standalone components |
| Estado reactivo | Angular Signals | Angular 18 built-in | Estado de UI, filtros y valores computados |
| Streams asíncronos | RxJS | ~7.8 | HTTP, delay, debounce y operadores reactivos |
| HTTP | Angular HttpClient | Angular 18 built-in | Comunicación con la API REST |
| Formularios | ReactiveFormsModule | Angular 18 built-in | Validación declarativa |
| Estilos | SCSS | — | Design system propio con custom properties CSS |
| Bundler | Vite (via Angular esbuild) | — | Build rápido basado en esbuild |

---

## Requisitos Previos

- **Node.js 18+** (se recomienda 20+ LTS).
- **Backend Task Manager API** corriendo en `http://localhost:3000`. Ver [`Task_periferia_back/README.md`](../Task_periferia_back/README.md).

---

## Instalación y Configuración

```bash
# 1. Entrar al directorio del proyecto
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

> **Importante:** El backend debe estar corriendo en `http://localhost:3000` antes de abrir la aplicación.

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo (`ng serve`) |
| `npm run build` | Genera el bundle de producción en `dist/` |
| `npm run watch` | Build en modo watch para desarrollo |
| `npm test` | Ejecuta los tests unitarios con Karma |

---

## Funcionalidades

| Funcionalidad | Descripción |
|--------------|-------------|
| **Listar tareas en grid** | Grid de 3 columnas (2 en tablet, 1 en móvil) con cards de altura uniforme |
| **Filtrar por estado** | Tabs: Todos / Pendientes / En progreso / Completadas — filtrado reactivo con Signals |
| **Buscar tareas** | Búsqueda instantánea con debounce 300ms combinada con el filtro de estado activo |
| **Crear tarea** | Formulario reactivo en modal — título, descripción y estado — con validaciones inline |
| **Editar tarea** | El mismo modal pre-poblado con los datos de la tarea seleccionada |
| **Eliminar tarea** | Modal de confirmación antes de eliminar para prevenir clics accidentales |
| **Skeleton loader** | 9 cards animadas con efecto shimmer durante los primeros 5 segundos de carga |
| **Contadores reactivos** | Total, Pendientes, En progreso y Completadas — computed signals actualizados automáticamente |
| **Toast notifications** | Feedback de éxito y error con auto-dismiss en 3 segundos |
| **Fondo animado** | Canvas con partículas conectadas por líneas estilo network graph (Discomaps) |
| **Estado vacío** | Mensaje contextual cuando no hay tareas o el filtro no da resultados |
| **Responsive** | Grid fluido a 2 columnas en tablet y 1 en móvil |

---

## Arquitectura

La aplicación aplica **Arquitectura Hexagonal al frontend**, separando el dominio, la lógica de aplicación, la infraestructura HTTP y la presentación.

### Diagrama de Dependencias

```
┌──────────────────────────────────────────────────────────────────┐
│  PRESENTATION                     INFRASTRUCTURE                  │
│  (Componentes)  ──► TaskFacade  ──► TaskRepositoryPort ──►       │
│                      │              (interfaz + token DI)         │
│                      │                    │                       │
│                      │               TaskHttpRepository           │
│                      │               (HttpClient → API)          │
│                      ▼                                            │
│                 DOMAIN                                            │
│                 Task (model), TaskStatus (enum)                   │
└──────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos — Crear Tarea

```
Usuario → "+ Nueva tarea"
  │
  ▼
tasks.component → openCreateForm() → formOpen.set(true)
  │
  ▼
task-form-modal aparece con formulario limpio (effect observa open())
  │
  ▼
Usuario completa el formulario y hace submit
  │
  ▼
task-form-modal emite (saved) con CreateTaskPayload
  │
  ▼
tasks.component → saveTask(payload) → facade.createTask(payload)
  │
  ▼
TaskFacade → runRequest(repo.create(payload), ...)
  │
  ▼
TaskHttpRepository → HttpClient.post('/tasks', payload) → API REST
  │
  ▼ Observable<Task>
facade: tasksSignal.update([newTask, ...tasks])
  │
  ▼
filteredTasks computed recalcula → nueva card visible en el grid
  │
  ▼
notificationService.success() → toast 3 segundos
```

### Flujo de Datos — Carga Inicial con Skeleton Loader

```
ngOnInit() → facade.loadTasks()
  │
  ▼
loadingSignal.set(true) → task-list recibe [loading]=true
  │
  ▼
9 skeleton cards con shimmer animado aparecen en el grid
  │
  ▼
taskRepository.findAll().pipe(delay(5000)) → API REST
  │
  ▼ Respuesta tras 5 segundos
tasksSignal.set(tasks) → filteredTasks recalcula
loadingSignal.set(false) → skeleton desaparece, cards reales aparecen
```

### Reglas de Arquitectura

- **`domain/`** — Solo interfaces y enums. Sin importaciones de Angular.
- **`application/ports/`** — Define `TaskRepositoryPort` (interfaz + `InjectionToken`). No importa `HttpClient`.
- **`infrastructure/repositories/`** — `TaskHttpRepository` implementa el puerto. Es el único lugar que conoce la URL de la API.
- **`application/use-cases/task.facade.ts`** — Centraliza estado (signals), casos de uso, filtros y notificaciones. Los componentes no llaman directamente a repositorios.
- **`presentation/`** — Solo componentes UI. Reciben datos via `input()` y emiten eventos via `output()`. No inyectan `HttpClient`.

---

## Componentes

### Árbol de Componentes

```
app-root
├── app-star-field              → Canvas con partículas animadas (fondo global)
└── tasks.component (página)
    ├── app-stats-counter       → Contadores por estado (computed signals)
    ├── app-status-filter-bar   → Tabs: Todos / Pendientes / En progreso / Completadas
    ├── app-search-bar          → Input con debounce 300ms
    ├── app-task-list           → Grid de cards (3-2-1 columnas)
    │   └── app-task-item       → Card individual glassmorphism + acciones
    │       └── app-task-status-badge → Badge visual del estado
    ├── app-task-form-modal     → Modal crear/editar (ReactiveForm)
    └── app-confirm-modal       → Confirmación antes de eliminar
```

### Detalle por Componente

| Componente | Responsabilidad |
|------------|-----------------|
| `app-star-field` | Canvas global con 80 partículas conectadas por líneas. Corre en `NgZone.runOutsideAngular()` para no afectar el change detection. |
| `app-tasks` | Contenedor principal. Inyecta `TaskFacade`. Orquesta los eventos entre componentes. |
| `app-stats-counter` | Muestra Total / Pendientes / En progreso / Completadas via 4 `input()` numéricos. |
| `app-status-filter-bar` | Tabs de filtro. Emite `filterChange: FilterOption`. El tab activo se marca con glow violeta. |
| `app-search-bar` | Input de búsqueda con debounce 300ms via RxJS. Emite `queryChange: string`. |
| `app-task-list` | Grid 3 columnas. Muestra skeleton cards si `[loading]=true`, cards reales si hay tareas, o estado vacío. |
| `app-task-item` | Card de 210px de altura fija. Header con badge y fecha, body con título y descripción, footer con Editar y Eliminar. |
| `app-task-status-badge` | Badge presentacional. Solo recibe `status`. Sin lógica. |
| `app-task-form-modal` | Modal con `ReactiveForm`. Validaciones inline. Resetea el formulario cada vez que se abre via `effect()` que observa `open()`. |
| `app-confirm-modal` | Modal genérico de confirmación. Emite `confirmed` o `cancelled`. |

---

## Design System

Inspirado en **Discomaps** — dark, vibrante, glassmorphism y fondo animado de partículas.

### Paleta de Colores

```scss
:root {
  /* Fondos */
  --bg-primary:    #07070e;   /* Base — negro profundo */
  --bg-card:       rgba(18, 16, 32, 0.7);  /* Card glassmorphism */
  --bg-nav:        rgba(15, 13, 26, 0.85); /* Navbar glassmorphism */

  /* Gradiente de fondo — idéntico a Discomaps */
  /* radial violeta en top center + cian en esquinas */

  /* Acento */
  --accent:        #7c3aed;  /* Violeta — botón primario, tabs activos, bordes hover */
  --accent-glow:   rgba(124, 58, 237, 0.22);
  --accent-hover:  #6d28d9;

  /* Estados semánticos */
  --status-pending:     #6b7280;  /* Gris   — Pendiente */
  --status-in-progress: #d97706;  /* Ámbar  — En progreso */
  --status-done:        #059669;  /* Verde  — Completado */

  /* Texto */
  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted:     #475569;

  /* Sombras */
  --shadow-card:   0 4px 24px rgba(0,0,0,0.5);
  --shadow-accent: 0 0 20px var(--accent-glow), 0 0 60px rgba(124,58,237,0.15);

  /* Glassmorphism */
  --blur-card:   blur(16px);
  --blur-nav:    blur(12px);
  --radius-md:   14px;
  --radius-sm:   6px;
}
```

### Tipografía

- **Fuente**: `Inter` (Google Fonts) → `system-ui` (fallback)
- **Pesos**: 400 (body), 500 (labels), 600 (títulos y botones)
- Sin serifa. Sin escalado por viewport. Letter-spacing 0.

### Layout

- **Navbar sticky** glassmorphism con logo, título, subtítulo reactivo y botón primario
- **Stats counter** en fila horizontal compacta
- **Tabs de filtro** + barra de búsqueda en la misma fila
- **Grid de cards**: 3 columnas (desktop) → 2 (≤900px) → 1 (≤560px)
- Cards de **210px** de altura fija, uniformes
- **Max-width 1280px** centrado con padding lateral 32px

### Animaciones

- Cards: `fade-in-up` al aparecer, `translateY(-3px)` en hover
- Skeleton: shimmer horizontal animado con `@keyframes shimmer`
- Spinner: anillo multi-capa con `@keyframes ring-spin`
- Partículas: `requestAnimationFrame` fuera de la zona de Angular

### Archivos del Design System

```
src/styles/
├── _variables.scss   → Todos los CSS Custom Properties (tokens)
├── _reset.scss       → Normalización de box-model
├── _typography.scss  → Fuentes y text-rendering
├── _animations.scss  → Keyframes globales (fade-in, fade-in-up, slide-up)
└── styles.scss       → Importa partials, define shell global y clases utilitarias
```

---

## Estructura de Carpetas

```
Task_periferia_front/
├── src/
│   ├── app/
│   │   ├── domain/                          # Sin dependencias de Angular
│   │   │   ├── models/
│   │   │   │   └── task.model.ts            # Interfaces Task, CreateTaskPayload, UpdateTaskPayload
│   │   │   └── enums/
│   │   │       └── task-status.enum.ts      # enum TaskStatus + TASK_STATUS_LABELS en español
│   │   │
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── task-repository.port.ts  # InjectionToken + interfaz TaskRepositoryPort
│   │   │   └── use-cases/
│   │   │       └── task.facade.ts           # Estado (signals), filtros, CRUD, notificaciones
│   │   │
│   │   ├── infrastructure/
│   │   │   └── repositories/
│   │   │       └── task-http.repository.ts  # Implementa TaskRepositoryPort con HttpClient
│   │   │
│   │   ├── presentation/
│   │   │   ├── pages/tasks/
│   │   │   │   ├── tasks.component.ts
│   │   │   │   ├── tasks.component.html
│   │   │   │   └── tasks.component.scss
│   │   │   └── components/
│   │   │       ├── star-field/              # Canvas de partículas (fondo global)
│   │   │       ├── task-list/               # Grid 3-2-1 + skeleton loader
│   │   │       ├── task-item/               # Card glassmorphism 210px
│   │   │       ├── task-form-modal/         # Modal crear/editar con ReactiveForm
│   │   │       ├── task-status-badge/       # Badge presentacional
│   │   │       ├── status-filter-bar/       # Tabs de filtro por estado
│   │   │       ├── stats-counter/           # Contadores reactivos
│   │   │       ├── search-bar/              # Input con debounce 300ms
│   │   │       ├── confirm-modal/           # Modal de confirmación genérico
│   │   │       ├── loading-spinner/         # Spinner con anillo + barra de progreso
│   │   │       └── toast-notification/      # Toasts con auto-dismiss
│   │   │
│   │   ├── shared/
│   │   │   └── services/
│   │   │       └── notification.service.ts
│   │   │
│   │   ├── app.component.ts                 # Root: star-field + router-outlet + toast host
│   │   ├── app.config.ts                    # provideHttpClient, provideRouter, TASK_REPOSITORY
│   │   └── app.routes.ts                    # Ruta lazy: '' → tasks.component
│   │
│   ├── environments/
│   │   └── environment.ts                   # { apiUrl: 'http://localhost:3000' }
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   ├── _animations.scss
│   │   └── (styles.scss en src/)
│   │
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── package.json
├── tsconfig.json
├── README.md
└── NOTES.md
```

---

## Decisiones de Diseño

### ¿Por qué Signals en lugar de solo RxJS?

Angular Signals son ideales para **estado local de la UI** y **valores derivados (computed)**. `TaskFacade` usa signals para el listado de tareas, el filtro de status activo (`statusFilterSignal`) y la búsqueda de texto (`searchQuerySignal`). El `filteredTasks` computed combina ambos filtros automáticamente sin coordinación manual. RxJS se mantiene donde es natural: HTTP con `HttpClient` y debounce en la barra de búsqueda.

### ¿Por qué skeleton loader en el grid en lugar de overlay?

El overlay cubre toda la pantalla, incluyendo el header, filtros y búsqueda. Esto es innecesario porque esos elementos no dependen de los datos de las tareas. Con el skeleton loader en el grid, el usuario ve la estructura completa de la app mientras carga y puede interactuar con los filtros.

### ¿Por qué cards de altura fija (210px)?

La uniformidad visual del grid es prioritaria. Con altura dinámica, las cards sin descripción serían significativamente más pequeñas que las que tienen descripción larga, rompiendo el ritmo visual de la cuadrícula. `overflow: hidden` recorta el exceso limpiamente.

### ¿Por qué el estado se cambia solo desde el modal de edición?

Tener un selector de estado en la card **y** la opción de cambiar el estado desde el modal de edición es UX redundante — el usuario tiene dos caminos distintos para la misma acción. La card muestra el estado actual via badge (lectura), y el modal es el único punto de escritura. Esto simplifica el modelo mental.

### ¿Por qué InjectionToken para el repositorio?

```typescript
export const TASK_REPOSITORY = new InjectionToken<TaskRepositoryPort>('TASK_REPOSITORY');

// app.config.ts
{ provide: TASK_REPOSITORY, useClass: TaskHttpRepository }
```

`TaskFacade` inyecta el token, no la clase concreta. En tests, se puede proveer un repositorio in-memory sin tocar el Facade ni los componentes.

### ¿Por qué standalone components?

Angular 18 con standalone components elimina los NgModules y hace explícito el grafo de dependencias de cada componente directamente en `imports: []`.

### ¿Por qué SCSS propio en lugar de Angular Material?

Implementar el design system desde cero con CSS Custom Properties demuestra dominio de SCSS, diseño de sistemas de tokens y conocimiento de cómo Angular gestiona los estilos por componente (`ViewEncapsulation.Emulated`). Una librería UI añadiría peso y opciones innecesarias para este alcance.
