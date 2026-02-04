# System Architecture & Staff-Level Patterns

This document details the advanced engineering patterns implemented to ensure this project meets the highest technical standards.

## 🏛️ Event-Driven Auditing (Non-Blocking)

To ensure the primary business transaction is not impacted by lateral concerns like logging, we implemented an **Asynchronous Auditing Pattern**.

- **Workflow**:
  1. `TaskService` publishes a `TaskAuditEvent` via Spring's `ApplicationEventPublisher`.
  2. The transaction finishes and returns the response to the user immediately.
  3. `TaskAuditListener` (annotated with `@Async`) picks up the event.
  4. The listener performs a diff and persists the `Activity` log in a separate thread.

## 🛡️ API Resilience: Rate Limiting

The API is protected by a custom `RateLimitInterceptor` that implements a **Fixed Window Counter** algorithm.

- **Threshold**: 60 requests per minute per IP.
- **Fail-fast**: Returns `429 Too Many Requests` when exceeded, protecting backend resources from exhaustive polling or brute-force.

## 📊 Observability: Business KPIs

Beyond technical health, the system exposes **Business Metrics** via Micrometer:

- `tasks.created`: Counter for total tasks generated.
- `tasks.completed`: Counter for workload finished.
- `tasks.deleted`: Tracking system churn.

Access these via `/actuator/metrics/tasks.created`.

## 🐳 Production Orchestration

The `docker-compose.yml` is configured for **High Availability Ready** status:

- **Condition-based Startup**: The UI container only boots after the API passes its `healthcheck`.
- **Healthchecks**: The API uses Spring Boot Actuator to communicate its readiness to the Docker engine.
- **Persistence**: H2 database remains file-based and mounted via volumes for data durability across container restarts.

---
Doc created by Antigravity for Wilque Messias.
