# Task Manager — Frontend

SPA Angular para gestión de tareas que consume una REST API. Permite listar, crear, editar, eliminar, filtrar y cambiar el estado de tareas con una interfaz dark y minimalista.

---

## Stack

| Tecnología | Versión |
|---|---|
| Angular | 18.1 |
| TypeScript | 5.5 |
| RxJS | 7.8 |
| Angular Signals | integrado en Angular 18 |
| Reactive Forms | integrado en Angular 18 |
| Karma + Jasmine | 6.4 / 5.1 |
| SCSS | — |

---

## Requisitos

- **Node.js** 20 LTS o superior
- **npm** 9 o superior
- Backend ejecutándose en `http://localhost:3000`

La URL base de la API se configura en:

```
src/environments/environment.ts
```

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:4200)
npm start

# Build de producción
npm run build

# Pruebas unitarias (modo watch)
npm test

# Pruebas unitarias sin watch (CI)
npm test -- --watch=false --browsers=ChromeHeadless
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `localhost:4200` |
| `npm run build` | Build de producción en `dist/` |
| `npm run watch` | Build en modo observación (desarrollo) |
| `npm test` | Pruebas unitarias con Karma |

---

## Arquitectura

El proyecto aplica **Arquitectura Hexagonal (Ports & Adapters)** al frontend Angular. La dirección de dependencias es estricta:

```
presentation → application → domain
infrastructure → application / domain
domain → (sin dependencias externas)
```

### Capas

| Capa | Responsabilidad |
|---|---|
| `domain` | Entidades, value objects, enums y errores de dominio. Sin dependencias de Angular ni librerías externas. |
| `application` | Casos de uso, comandos, queries y el puerto `TaskRepositoryPort`. Orquesta la lógica sin acoplarse a infraestructura. |
| `infrastructure` | Implementa el puerto con `HttpClient`. Incluye DTOs, mapper y token de inyección. |
| `presentation` | Componentes standalone, páginas, `TaskFacade` y view-models. La UI nunca llama directamente a `HttpClient`. |
| `shared` | Servicios transversales (`NotificationService`). |
| `app.config.ts` | Composition root de Angular: registra el repositorio concreto contra el puerto. |

### Flujo de datos

```
Component → TaskFacade → UseCase → TaskRepositoryPort
                                         ↓
                                TaskHttpRepository (HttpClient)
```

---

## Estructura del proyecto

```
src/
  app/
    domain/
      entities/
        task.entity.ts          # Entidad Task (inmutable, factory methods)
        task.entity.spec.ts
      enums/
        task-status.enum.ts     # pending | in_progress | done
      errors/
        domain-error.ts
      models/
        task.model.ts           # TaskPrimitives (DTO interno de dominio)
      value-objects/
        task-id.ts
        task-title.ts           # Validación: 3-100 caracteres
        task-description.ts     # Validación: máx. 500 caracteres

    application/
      models/
        task-use-case.models.ts # Comandos, queries y tipos de resultado
      ports/
        task-repository.port.ts # Puerto outbound (interfaz)
      use-cases/
        list-tasks-page.use-case.ts
        create-task.use-case.ts
        update-task.use-case.ts
        delete-task.use-case.ts
        change-task-status.use-case.ts
        change-task-status.use-case.spec.ts

    infrastructure/
      composition/
        task-repository.token.ts  # InjectionToken para el puerto
      dto/
        task-api.dto.ts           # Shape de la respuesta de la API
      mappers/
        task-http.mapper.ts       # Traduce DTO ↔ TaskEntity
        task-http.mapper.spec.ts
      repositories/
        task-http.repository.ts   # Implementación con HttpClient

    presentation/
      components/
        confirm-modal/
        loading-spinner/
        search-bar/
        star-field/               # Canvas con partículas animadas (fondo)
        stats-counter/
        status-filter-bar/
        task-form-modal/
        task-item/
        task-list/
        task-status-badge/
        toast-notification/
      pages/
        tasks/                    # Página principal (contenedor)
      state/
        task.facade.ts            # Estado centralizado con Angular Signals
      view-models/
        task.view-model.ts
        task-status-labels.ts

    shared/
      services/
        notification.service.ts

    app.config.ts    # Composition root
    app.routes.ts

  environments/
    environment.ts
    environment.development.ts

  styles/            # Variables SCSS globales, reset y animaciones
```

---

## Componentes principales

| Componente | Descripción |
|---|---|
| `tasks.page` | Contenedor principal. Inyecta `TaskFacade` y compone el layout. |
| `task-list` | Grid responsivo de cards. Recibe tareas via `@Input` y emite acciones. |
| `task-item` | Card individual: título, descripción, badge de status, fecha y acciones. |
| `task-form-modal` | Formulario Reactivo de crear/editar con validaciones inline. |
| `task-status-badge` | Badge presentacional del estado de la tarea. |
| `status-filter-bar` | Tabs de filtro: All / Pending / In Progress / Done. |
| `stats-counter` | Contadores calculados con `computed` signals: total, pending, in_progress, done. |
| `search-bar` | Búsqueda con debounce de 300 ms. |
| `confirm-modal` | Confirmación antes de eliminar una tarea. |
| `loading-spinner` | Indicador de carga overlay. |
| `toast-notification` | Mensajes de éxito y error con auto-dismiss y slide-in. |
| `star-field` | Canvas con partículas animadas conectadas tipo network graph (fondo). |

---

## Estado con Angular Signals

`TaskFacade` centraliza todo el estado de la aplicación usando signals de Angular 18:

```typescript
// Señales de escritura (privadas)
private readonly tasksSignal    = signal<TaskViewModel[]>([]);
private readonly loadingSignal  = signal(false);
private readonly errorSignal    = signal<string | null>(null);
private readonly statusFilterSignal = signal<TaskStatus | 'all'>('all');

// Señales derivadas (computed, solo lectura)
readonly filteredTasks  = computed(() => { /* búsqueda + filtro */ });
readonly totalTasks     = computed(() => this.totalSignal());
readonly pendingTasks   = computed(() => /* filter pending */);
readonly inProgressTasks = computed(() => /* filter in_progress */);
readonly doneTasks      = computed(() => /* filter done */);
```

---

## API consumida

Base URL: `http://localhost:3000`

| Acción | Método | Endpoint |
|---|---|---|
| Listar tareas (paginado) | `GET` | `/tasks?page={n}&limit={n}` |
| Obtener tarea | `GET` | `/tasks/{id}` |
| Crear tarea | `POST` | `/tasks` |
| Actualizar tarea | `PUT` | `/tasks/{id}` |
| Eliminar tarea | `DELETE` | `/tasks/{id}` |

### Modelo de tarea

```typescript
type TaskStatus = "pending" | "in_progress" | "done";

type Task = {
  id: string;          // UUID generado por el backend
  title: string;       // Requerido, 3–100 caracteres
  description?: string; // Opcional, máx. 500 caracteres
  status: TaskStatus;  // Default: "pending"
  createdAt: string;   // ISO 8601, generado por el backend
  updatedAt: string;   // ISO 8601, actualizado por el backend
};
```

---

## Pruebas

Las pruebas cubren:

- **Dominio**: `task.entity.spec.ts` — rehydrate, validaciones de value objects.
- **Aplicación**: `change-task-status.use-case.spec.ts` — lógica de caso de uso con repositorio mockeado.
- **Infraestructura**: `task-http.mapper.spec.ts` — traducción DTO ↔ entidad de dominio.

```bash
# Ejecutar todas las pruebas en modo headless
npm test -- --watch=false --browsers=ChromeHeadless
```

---

## Design system

La UI sigue el sistema de diseño definido para el proyecto:

- **Fondo**: `#0a0a0f` con canvas animado de partículas conectadas.
- **Acento**: `#7c3aed` (violeta) con glow en hover.
- **Cards**: glassmorphism con border violeta, elevación en hover.
- **Grid**: 3 columnas en desktop, 2 en tablet, 1 en mobile.
- **Tipografía**: Space Grotesk / Inter, pesos 400/500/600.
- **Estados**: `pending` gris · `in_progress` ámbar · `done` verde esmeralda.

---

## Dependencias

### Producción

| Paquete | Versión |
|---|---|
| `@angular/core` | ^18.1.0 |
| `@angular/forms` | ^18.1.0 |
| `@angular/router` | ^18.1.0 |
| `rxjs` | ~7.8.0 |
| `zone.js` | ~0.14.3 |

### Desarrollo

| Paquete | Versión |
|---|---|
| `@angular/cli` | ^18.1.2 |
| `typescript` | ~5.5.2 |
| `karma` | ~6.4.0 |
| `jasmine-core` | ~5.1.0 |

---

## Licencia

Uso privado — prueba técnica.
