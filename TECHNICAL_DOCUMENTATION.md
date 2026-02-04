# Technical Documentation: To Do GP Implementation Details

![Architecture Abstract](./docs/assets/architecture.png)

## 🏛️ Component Architecture

The system operates as a distributed architecture with a clear separation between the stateful backend and the stateless (optimistic) frontend.

```mermaid
graph LR
    subgraph "Frontend Layer (React)"
        Store["useKanbanTasks Hook"]
        UI["Kanban Board / Components"]
        DND["@dnd-kit Orchestrator"]
    end

    subgraph "Backend Layer (Spring Boot)"
        Controller["REST Controller"]
        Service["TaskService / Audit Logic"]
        Repo["JPA Repositories / Native SQL"]
    end

    subgraph "Persistence Layer"
        DB[("H2 Database")]
    end

    UI <--> Store
    Store <--> DND
    Store -- "JSON DTO" --> Controller
    Controller <--> Service
    Service <--> Repo
    Service -- "Event" --> EventBus["Application Event Bus"]
    EventBus -- "Async" --> Audit["TaskAuditListener"]
    Audit -- "Log" --> Repo
    Repo <--> DB
```

---

## 🧬 Data Model (ER Diagram)

The persistence layer is managed by Hibernate/JPA, implementing a one-to-many relationship from the main `Task` entity to both `Subtask` and `Activity` logs.

```mermaid
erDiagram
    TASK ||--o{ SUBTASK : contains
    TASK ||--o{ ACTIVITY : logs
    
    TASK {
        UUID id PK
        string title
        string description
        enum status
        enum priority
        datetime due_date
        datetime completed_at
        datetime created_at
        datetime updated_at
        boolean deleted
        boolean important
    }
    
    SUBTASK {
        UUID id PK
        string title
        boolean completed
        UUID task_id FK
    }
    
    ACTIVITY {
        UUID id PK
        string message
        datetime timestamp
        UUID task_id FK
    }
```

---

## ⚙️ Core Operational Flows

### 1. Differential Audit Pattern
The system implements a manual "diffing" mechanism during entity updates to maintain an immutable audit trail.

```mermaid
sequenceDiagram
    participant UI as Frontend SPA
    participant SVC as TaskService
    participant DB as Persistence Layer

    UI->>SVC: PUT /tasks/{id} (TaskDTO)
    SVC->>DB: Fetch and Update Task State
    SVC-->>UI: 200 OK (Immediate Response)
    
    Note over SVC,Audit: Asynchronous Background Flow
    SVC->>Audit: Publish TaskAuditEvent
    Audit->>Audit: Calculate Values Diff
    Audit->>DB: Persist Activity Log
```

### 2. Logical Deletion (Soft-Delete)
Persistence is managed via a logical flag to ensure history retention and instant restoration.
- **Logic**: `@SQLDelete(sql = "UPDATE tasks SET deleted = true WHERE id=?")`
- **Retention**: Filtered via `@SQLRestriction("deleted = false")` in normal operations.
- **Recovery**: Native SQL Bypass: `UPDATE tasks SET deleted = false WHERE id = :id`.

---

## 📡 API Topology (Operational)

### Endpoint Specification
| Method | Endpoint | Logic Complexity | Side Effects |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | O(1) | None |
| `POST` | `/tasks` | O(N) | Activity creation |
| `PUT` | `/tasks/{id}` | O(Diff * N) | Multiple Activity insertions |
| `DELETE` | `/tasks/{id}` | O(1) | Flag Toggle |
| `POST` | `/tasks/{id}/restore` | O(1) | Flag Toggle + Async Event |

---

## 🛡️ Resilience & Engineering Excellence

### 1. Request Rate Limiting
To protect backend resources, the system implements a fixed-window counter interceptor.
- **Limit**: 60 req/min per IP.
- **Fail-Safe**: Automated `429 Too Many Requests` responses.

### 2. Deep Observability (SLIs/SLOs)
The application exposes business-level metrics via **Micrometer** targets:
- `tasks.created` / `tasks.completed`: Throughput metrics for system utility.
- `/actuator/health`: Granular readiness probes for Docker orchestration.

---

## 🖥️ Frontend State Orchestration

The UI utilizes **Optimistic Updates** to provide zero-latency interactions:
1. **Trigger**: User interacts with UI (e.g., drag card).
2. **Local State**: The `useKanbanTasks` hook updates the local task list immediately.
3. **Synchronization**: An asynchronous `PATCH/PUT` request is dispatched to the backend.
4. **Reconciliation**: On failure, the local state is rolled back; on success, it remains identical.

---
<div align="center">
Documented for Technical Review by Wilque Messias © 2026.
</div>
