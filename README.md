# Task Manager App

SPA Angular para gestionar tareas consumiendo la API `Task Manager API`.

## Stack

- Angular 18
- Standalone components
- SCSS
- Angular Signals
- RxJS
- Reactive Forms
- HttpClient
- Arquitectura hexagonal en frontend

## Instalación

```bash
npm install
npm start
```

Aplicación local:

```text
http://localhost:4200
```

Backend esperado:

```text
http://localhost:3000
```

La URL del backend se configura en:

```text
src/environments/environment.ts
```

## Scripts

```bash
npm run build
npm start
npm test
```

## Funcionalidades

- Listar tareas.
- Crear tarea.
- Editar tarea.
- Eliminar tarea con confirmación.
- Cambiar estado desde cada fila.
- Buscar por título, descripción o estado con debounce.
- Contadores reactivos por estado.
- Toasts de éxito/error.
- Overlay de carga.

## Arquitectura

```text
src/app/
  domain/
    enums/
    models/
  application/
    ports/
    use-cases/
  infrastructure/
    repositories/
  presentation/
    pages/
    components/
  shared/
    services/
```

Reglas aplicadas:

- `domain` no depende de Angular.
- `TaskRepositoryPort` define el contrato de persistencia.
- `TaskHttpRepository` implementa el puerto con `HttpClient`.
- `TaskFacade` concentra estado, casos de uso y signals.
- Los componentes de presentación reciben datos y emiten eventos.

## Design system

Estilo dark, compacto y de alta densidad:

- Fondo principal `#0a0a0f`.
- Superficies `#13131c`.
- Acento violeta `#7c3aed`.
- Bordes sutiles.
- Radios de 4px a 6px.
- Tablas/listas densas.

Los tokens viven en:

```text
src/styles/_variables.scss
```

## Verificación

```bash
npm run build
```

