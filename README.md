# To Do GP

![System Hero](./docs/assets/hero.png)

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/WilqueMessias)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://br.linkedin.com/in/wilquemessias)

**[Read in English](README.md)** | **[Leia em Português](./docs/README.pt-BR.md)**

---

**[Technical Specification](./docs/ARCHITECTURE.md)** · **[Backend API](./tm-api/README.md)** · **[Frontend SPA](./tm-ui/README.md)**

</div>

---

## System Specification

**To Do GP** is a decoupled task management architecture implemented using **Java 17 (Spring Boot 3.4)** and **TypeScript (React 18)**. The design focuses on asynchronous state synchronization, non-blocking auditing pipelines, and strict domain-driven encapsulation to maintain data integrity and system availability.

---

## Project Topology

The system adopts a **Separated Core** pattern, establishing a rigid boundary between transactional state management and the reactive presentation layer.

- **Backend Protocol**: Orchestrates domain invariants, immutable event logging, and ACID-compliant state transitions.
- **Presentation Layer**: Implements optimistic state reconciliation, physics-based interaction models, and persistent analytical normalization.

---

## Implementation Patterns

- **Event-Driven Audit Pipeline**: Asynchronous field-level differential tracking utilizing Spring `ApplicationEvent` propagation and dedicated thread-pool isolation via `@Async`.
- **Traffic Resilience**: Protective **RateLimitInterceptor** (Fixed-Window Counter) safeguarding computational resources and API throughput.
- **Deep Observability**: Instrumentation via **Micrometer** for SLI monitoring and custom **Spring Actuator** health probes for business-critical telemetry.
- **Infrastructure Abstraction**: Multi-stage Docker orchestration with automated service-health verification loops for deterministic startup sequencing.

---

## Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Java 17 / Node 18 | Industry-standard stability and performance. |
| **Frameworks** | Spring Boot / React | Robust ecosystem for enterprise and componentized UI patterns. |
| **Security** | RateLimit Interceptor | Protection against resource exhaustion and brute-force. |
| **Observability** | Micrometer | Professional SLI/SLO monitoring and telemetry. |
| **Infrastructure** | Docker / Compose | Multi-stage builds and containerized orchestration. |

---

## Prerequisites

- **Java 17** (JDK)
- **Maven** (for local development)
- **Node 18**
- **Docker + Docker Compose** (for production run)

---

## Environment Variables (Optional)

**Backend (Spring Boot):**
- `SERVER_PORT` (default: `8080`)
- `SPRING_DATASOURCE_URL` (default: `jdbc:h2:file:./data/tmdb`)
- `SPRING_DATASOURCE_USERNAME` (default: `sa`)
- `SPRING_DATASOURCE_PASSWORD` (default: empty)

**Frontend:**
- `VITE_API_BASE_URL` (default: `http://localhost:8080`)
	- Example: copy [tm-ui/.env.example](tm-ui/.env.example) to `tm-ui/.env`

## Execution

### 1) Production (Docker Compose)
**Quick start (scripts):**
- Windows: `start.bat`
- Linux/Mac: `start.sh`

**Manual run:**
```bash
docker-compose up -d --build
```
- **Interface**: [http://localhost](http://localhost)
- **API Spec**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

### 2) Development (Local)
**Install frontend deps:**
```bash
cd tm-ui
npm install
```

**Run backend:**
```bash
cd tm-api
mvn clean spring-boot:run
```

**Run frontend:**
```bash
cd tm-ui
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:8080](http://localhost:8080)

---

## Ports

- **Frontend (dev)**: `5173`
- **Frontend (prod)**: `80`
- **Backend API**: `8080`

---

## Tests

**Backend:**
```bash
cd tm-api
mvn test
```

**Frontend (lint):**
```bash
cd tm-ui
npm run lint
```

---

## Troubleshooting

- **Port conflicts**: stop processes on `8080` or `5173` and retry.
- **Docker build slow**: run `docker system prune` and rebuild.
- **API not healthy**: check [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health).

---

## Analytics & SLIs

- **Kanban Velocity**: Moving-window calculation of task throughput within a 168-hour horizon.
- **Cycle Time**: Statistical analysis of lead time from record initialization to terminal state.
- **Distribution Analysis**: Percentage-based visualization of tasks across state clusters.

---
<div align="center">
Technical Design by Wilque Messias © 2026.
</div>
