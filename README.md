# Task Manager — Frontend

SPA Angular para gestión de tareas que consume una REST API. Permite listar, crear, editar, eliminar, filtrar y cambiar el estado de tareas con una interfaz dark y minimalista.

---

## Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Instalación](#instalación)
3. [Stack](#stack)
4. [Scripts](#scripts)
5. [Arquitectura](#arquitectura)
6. [Estructura de Carpetas](#estructura-de-carpetas)
7. [Componentes](#componentes)
8. [Estado con Angular Signals](#estado-con-angular-signals)
9. [API Consumida](#api-consumida)
10. [Pruebas](#pruebas)
11. [Design System](#design-system)
12. [Dependencias](#dependencias)

---

## Requisitos

- **Node.js 20+ LTS**
- **npm 9+**
- Backend ejecutándose en `http://localhost:3000`

La URL base de la API se configura en:

```
src/environments/environment.ts
```

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

---

## Stack

| Tecnología           | Versión                  |
|----------------------|--------------------------|
| Angular              | 18.1                     |
| TypeScript           | 5.5                      |
| RxJS                 | 7.8                      |
| Angular Signals      | integrado en Angular 18  |
| Reactive Forms       | integrado en Angular 18  |
| Karma + Jasmine      | 6.4 / 5.1                |
| SCSS                 | —                        |

---

## Scripts

| Script               | Descripción                                          |
|----------------------|------------------------------------------------------|
| `npm start`          | Servidor de desarrollo en `localhost:4200`           |
| `npm run build`      | Compila la aplicación a `dist/`                      |
| `npm run watch`      | Build en modo observación (desarrollo)               |
| `npm test`           | Ejecuta pruebas unitarias con Karma                  |

---

## Arquitectura

El proyecto aplica **Arquitectura Hexagonal (Ports & Adapters)** al frontend Angular. El objetivo es mantener el núcleo de negocio (dominio y casos de uso) completamente independiente de Angular, RxJS y del contrato HTTP del backend.

### Principio de Dependencias

```
presentation  →  application (casos de uso)  →  domain (entidades)
infrastructure →  application / domain
domain         →  nada externo
```

La regla verificable: el directorio `src/app/domain/` no tiene ninguna importación de Angular, RxJS ni librerías externas.

### Las Cinco Capas

**1. Domain** (`src/app/domain/`)
Contiene las reglas de negocio puras. No depende de ninguna librería externa.
- `TaskEntity` — entidad con métodos `rehydrate()`, `rename()`, `updateDescription()`, `changeStatus()`, `toPrimitives()`.
- `TaskTitle`, `TaskDescription`, `TaskId` — value objects que encapsulan invariantes de dominio.
- `TaskStatus` — enum con los tres estados válidos: `pending`, `in_progress`, `done`.

**2. Application** (`src/app/application/`)
Contiene los casos de uso. Orquesta el dominio usando el puerto, sin saber qué lo implementa.
- `ListTasksPageUseCase` — obtiene tareas paginadas del repositorio.
- `CreateTaskUseCase` — valida y crea la entidad `Task`, la persiste a través del puerto.
- `UpdateTaskUseCase` — busca la tarea, aplica los cambios en la entidad y persiste.
- `DeleteTaskUseCase` — elimina la tarea a través del puerto.
- `ChangeTaskStatusUseCase` — busca la tarea, cambia su estado en la entidad y persiste.
- `TaskRepositoryPort` — puerto outbound que abstrae la persistencia.

**3. Infrastructure** (`src/app/infrastructure/`)
Implementa el puerto usando `HttpClient`.
- `TaskHttpRepository` — implementa `TaskRepositoryPort`. Es el único lugar donde existe `HttpClient` en el proyecto.
- `TaskHttpMapper` — traduce `TaskApiDto` (respuesta HTTP) a `TaskEntity` y viceversa.
- `task-repository.token.ts` — `InjectionToken` de Angular para desacoplar el puerto de su implementación.

**4. Presentation** (`src/app/presentation/`)
Traduce entre la UI y la capa de aplicación.
- `TaskFacade` — estado de pantalla centralizado con Angular Signals. Orquesta casos de uso, loading, errores y filtros.
- Componentes standalone — reciben datos por `input()` y emiten acciones por `output()`. No llaman `HttpClient` directamente.

**5. Composition Root** (`src/app/app.config.ts`)
Registra el repositorio concreto contra el token y construye cada caso de uso inyectando el repositorio.

```typescript
{
  provide: TASK_REPOSITORY,
  useClass: TaskHttpRepository,
},
{
  provide: ListTasksPageUseCase,
  useFactory: () => new ListTasksPageUseCase(inject(TASK_REPOSITORY)),
},
```

### Flujo de Datos

```
Component → TaskFacade → UseCase → TaskRepositoryPort
                                         ↓
                              TaskHttpRepository (HttpClient)
                                         ↓
                                  REST API :3000
```

---

## Estructura de Carpetas

```
Task_periferia_front/
├── src/
│   ├── app/
│   │   ├── domain/                           # Núcleo de negocio — sin dependencias externas
│   │   │   ├── entities/
│   │   │   │   ├── task.entity.ts            # Clase TaskEntity con factory methods y métodos de dominio
│   │   │   │   └── task.entity.spec.ts
│   │   │   ├── enums/
│   │   │   │   └── task-status.enum.ts       # pending | in_progress | done
│   │   │   ├── errors/
│   │   │   │   └── domain-error.ts
│   │   │   ├── models/
│   │   │   │   └── task.model.ts             # TaskPrimitives — serialización/deserialización de entidad
│   │   │   └── value-objects/
│   │   │       ├── task-id.ts
│   │   │       ├── task-title.ts             # Validación: 3–100 caracteres
│   │   │       └── task-description.ts       # Validación: máx. 500 caracteres
│   │   │
│   │   ├── application/                      # Casos de uso — orquesta dominio sin conocer infraestructura
│   │   │   ├── models/
│   │   │   │   └── task-use-case.models.ts   # Comandos, queries y tipos de resultado
│   │   │   ├── ports/
│   │   │   │   └── task-repository.port.ts   # Puerto outbound (interfaz)
│   │   │   └── use-cases/
│   │   │       ├── list-tasks-page.use-case.ts
│   │   │       ├── create-task.use-case.ts
│   │   │       ├── update-task.use-case.ts
│   │   │       ├── delete-task.use-case.ts
│   │   │       ├── change-task-status.use-case.ts
│   │   │       └── change-task-status.use-case.spec.ts
│   │   │
│   │   ├── infrastructure/                   # Implementaciones concretas — conoce HttpClient
│   │   │   ├── composition/
│   │   │   │   └── task-repository.token.ts  # InjectionToken para el puerto
│   │   │   ├── dto/
│   │   │   │   └── task-api.dto.ts           # Shape exacto de la respuesta HTTP del backend
│   │   │   ├── mappers/
│   │   │   │   ├── task-http.mapper.ts       # Traduce TaskApiDto ↔ TaskEntity
│   │   │   │   └── task-http.mapper.spec.ts
│   │   │   └── repositories/
│   │   │       └── task-http.repository.ts   # Implementa TaskRepositoryPort con HttpClient
│   │   │
│   │   ├── presentation/                     # UI — componentes standalone, facade y view-models
│   │   │   ├── components/
│   │   │   │   ├── confirm-modal/            # Confirmación antes de eliminar
│   │   │   │   ├── loading-spinner/          # Spinner de carga overlay
│   │   │   │   ├── search-bar/               # Búsqueda con debounce 300 ms
│   │   │   │   ├── star-field/               # Canvas con partículas animadas (fondo)
│   │   │   │   ├── stats-counter/            # Contadores por estado con computed signals
│   │   │   │   ├── status-filter-bar/        # Tabs: All / Pending / In Progress / Done
│   │   │   │   ├── task-form-modal/          # Modal crear/editar con Reactive Forms
│   │   │   │   ├── task-item/                # Card individual con acciones
│   │   │   │   ├── task-list/                # Grid de cards con infinite scroll
│   │   │   │   ├── task-status-badge/        # Badge presentacional del estado
│   │   │   │   └── toast-notification/       # Toasts de éxito y error con auto-dismiss
│   │   │   ├── pages/
│   │   │   │   └── tasks/                    # Página principal (contenedor)
│   │   │   ├── state/
│   │   │   │   └── task.facade.ts            # Estado centralizado con Angular Signals
│   │   │   └── view-models/
│   │   │       ├── task.view-model.ts
│   │   │       └── task-status-labels.ts
│   │   │
│   │   ├── shared/
│   │   │   └── services/
│   │   │       └── notification.service.ts
│   │   │
│   │   ├── app.config.ts                     # Composition root: DI y providers
│   │   └── app.routes.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   │
│   └── styles/                               # Variables SCSS globales, reset y animaciones
│
├── .gitignore
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Componentes

| Componente           | Responsabilidad                                                            |
|----------------------|----------------------------------------------------------------------------|
| `tasks.page`         | Contenedor principal. Inyecta `TaskFacade` y compone el layout.            |
| `task-list`          | Grid responsivo de cards con empty state e infinite scroll.                |
| `task-item`          | Card individual: título, descripción, badge de status, fecha y acciones.   |
| `task-form-modal`    | Formulario Reactivo de crear/editar con validaciones inline.               |
| `task-status-badge`  | Badge presentacional del estado de la tarea.                               |
| `status-filter-bar`  | Tabs de filtro: All / Pending / In Progress / Done.                        |
| `stats-counter`      | Contadores calculados con `computed` signals: total, pending, in_progress, done. |
| `search-bar`         | Búsqueda con debounce de 300 ms.                                           |
| `confirm-modal`      | Confirmación antes de eliminar una tarea.                                  |
| `loading-spinner`    | Indicador de carga overlay.                                                |
| `toast-notification` | Mensajes de éxito y error con auto-dismiss y slide-in.                     |
| `star-field`         | Canvas con partículas animadas conectadas tipo network graph (fondo).      |

---

## Estado con Angular Signals

`TaskFacade` centraliza todo el estado de la aplicación usando signals de Angular 18:

```typescript
// Señales de escritura (privadas)
private readonly tasksSignal         = signal<TaskViewModel[]>([]);
private readonly loadingSignal       = signal(false);
private readonly errorSignal         = signal<string | null>(null);
private readonly statusFilterSignal  = signal<TaskStatus | 'all'>('all');
private readonly statsSignal         = signal<TaskStatsResult>({ pending: 0, inProgress: 0, done: 0 });

// Señales derivadas (computed, solo lectura)
readonly filteredTasks   = computed(() => { /* búsqueda de texto local */ });
readonly totalTasks      = computed(() => this.totalSignal());
readonly pendingTasks    = computed(() => this.statsSignal().pending);
readonly inProgressTasks = computed(() => this.statsSignal().inProgress);
readonly doneTasks       = computed(() => this.statsSignal().done);
```

---

## API Consumida

Base URL: `http://localhost:3000`

| Método   | Ruta              | Descripción                   | Códigos              |
|----------|-------------------|-------------------------------|----------------------|
| `GET`    | `/tasks`          | Lista tareas paginadas (soporta `?status`) | 200, 500             |
| `GET`    | `/tasks/:id`      | Obtiene una tarea por ID      | 200, 404, 500        |
| `POST`   | `/tasks`          | Crea una nueva tarea          | 201, 400, 422, 500   |
| `PUT`    | `/tasks/:id`      | Actualiza una tarea existente | 200, 400, 404, 422, 500 |
| `DELETE` | `/tasks/:id`      | Elimina una tarea             | 204, 404, 500        |

### Modelo de Datos

```typescript
type TaskStatus = "pending" | "in_progress" | "done";

type Task = {
  id:          string;      // UUID generado por el backend
  title:       string;      // Requerido, 3–100 caracteres
  description: string;      // Opcional, máx. 500 caracteres
  status:      TaskStatus;  // Por defecto "pending"
  createdAt:   string;      // ISO 8601, generado al crear
  updatedAt:   string;      // ISO 8601, actualizado en cada modificación
};
```

---

## Pruebas

Las pruebas cubren las fronteras de mayor riesgo:

- **Dominio**: `task.entity.spec.ts` — rehydrate, validaciones de value objects e inmutabilidad.
- **Aplicación**: `change-task-status.use-case.spec.ts` — lógica de caso de uso con repositorio falso (sin `HttpClient`).
- **Infraestructura**: `task-http.mapper.spec.ts` — traducción `TaskApiDto` ↔ `TaskEntity`.

```bash
# Ejecutar todas las pruebas en modo headless
npm test -- --watch=false --browsers=ChromeHeadless
```

---

## Design System

| Token               | Valor                                                       |
|---------------------|-------------------------------------------------------------|
| Fondo               | `#0a0a0f` con canvas animado de partículas conectadas       |
| Acento              | `#7c3aed` (violeta) con glow en hover                       |
| Cards               | Glassmorphism con border violeta, elevación en hover        |
| Grid                | 3 columnas desktop · 2 tablet · 1 mobile                    |
| Tipografía          | Space Grotesk / Inter — pesos 400/500/600                   |
| Estado pending      | Gris `#6b7280`                                              |
| Estado in_progress  | Ámbar `#d97706`                                             |
| Estado done         | Verde esmeralda `#059669`                                   |

---

## Dependencias

### Producción

| Paquete              | Versión    |
|----------------------|------------|
| `@angular/core`      | ^18.1.0    |
| `@angular/forms`     | ^18.1.0    |
| `@angular/router`    | ^18.1.0    |
| `rxjs`               | ~7.8.0     |
| `zone.js`            | ~0.14.3    |

### Desarrollo

| Paquete              | Versión    |
|----------------------|------------|
| `@angular/cli`       | ^18.1.2    |
| `typescript`         | ~5.5.2     |
| `karma`              | ~6.4.0     |
| `jasmine-core`       | ~5.1.0     |

---

## Licencia

Uso privado — prueba técnica.
