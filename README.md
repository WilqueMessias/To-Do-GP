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

**To Do GP** is a decoupled task management system implemented using **Java 17 (Spring Boot 3.2.2)** and **TypeScript (React 19)**. The design uses asynchronous state synchronization and non-blocking audit logging with domain-oriented boundaries to preserve data integrity.

---

## Project Topology

The system adopts a **Distributed Monolith** pattern, establishing a rigid boundary between transactional state management and the reactive presentation layer.

- **Backend Protocol**: Orchestrates domain invariants, immutable event logging, and ACID-compliant state transitions.
- **Presentation Layer**: Implements optimistic state reconciliation, physics-based interaction models, and persistent analytical normalization.

---

## Implementation Patterns

- **Event-Driven Audit Pipeline**: Asynchronous field-level differential tracking utilizing Spring `ApplicationEvent` propagation and dedicated thread-pool isolation via `@Async`.
- **Traffic Resilience**: **RateLimitInterceptor** (Fixed-Window Counter) to protect resources and API throughput.
- **Deep Observability**: Instrumentation via **Micrometer** for SLI monitoring and custom **Spring Actuator** health probes for business-critical telemetry.
- **Infrastructure Abstraction**: Multi-stage Docker orchestration with service-health verification for startup sequencing.

---

## Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Java 17 / Node 18 | Industry-standard stability and performance. |
| **Frameworks** | Spring Boot / React | Common ecosystem for server and component-based UI patterns. |
| **Security** | RateLimit Interceptor | Protection against resource exhaustion and brute-force. |
| **Observability** | Micrometer | SLI/SLO monitoring and telemetry. |
| **Infrastructure** | Docker / Compose | Multi-stage builds and containerized orchestration. |

---

## Prerequisites

- **Java 17** (JDK)
- **Maven** (for local development)
- **Node 18**
 - **Docker + Docker Compose** (for production run)
 - **Windows**: Docker Desktop
	 - **Home**: requires **WSL2** backend
	 - **Pro/Enterprise**: **WSL2** recommended; **Hyper‑V** engine optional

---

## Host Requirements & Compatibility

Target environment: 64‑bit developer workstations capable of running Docker Desktop/Engine.

**Supported operating systems (Docker runtime):**
- Windows 10/11 64‑bit with Docker Desktop
	- Home: Docker Desktop with **WSL2** backend (required)
	- Pro/Enterprise: Docker Desktop with **WSL2** backend (recommended) or **Hyper‑V** engine
- Linux (x86_64) with Docker Engine 24+ and Docker Compose v2
- macOS 12+ (Apple Silicon or Intel) with Docker Desktop

**Minimum hardware profile (for Docker builds + runtime):**
- CPU: 64‑bit dual‑core (x86_64 or Apple Silicon)
- Memory: 8 GB RAM
- Disk: ~10 GB free (images + build caches)

**Local development without Docker (Execution → Development):**
- Same CPU/memory class as above, plus:
	- Java 17 JDK and Maven 3.9+
	- Node.js 18+ and npm

Notes:
- Build time is primarily constrained by CPU, disk I/O, and network throughput when pulling dependencies and images.
- The UI build uses Vite and will run faster with higher single‑core performance and SSD storage.

---

## Windows WSL2 Setup (for Docker)

Docker Desktop on Windows uses the WSL2 backend. Ensure WSL2 is enabled before running containers.

**Enable WSL2 (Windows 10/11):**
```powershell
wsl --install
wsl --version
```
If `wsl --install` isn’t available, follow Microsoft’s guide: https://learn.microsoft.com/windows/wsl/install

**Docker Desktop configuration:**
- Install Docker Desktop and enable "Use the WSL 2 based engine".
- Install a Linux distro (e.g., Ubuntu) via Microsoft Store.
- In Docker Desktop: Settings → Resources → WSL Integration → enable your distro.

Alternative (Pro/Enterprise): you may use the Hyper‑V based engine instead of WSL2 (Settings → General → uncheck WSL 2 engine). Compose v2 works with either backend.

After WSL2 and Docker Desktop are set, proceed to the Execution section.

---

## Clone the Repository

Use Git to download the project locally.

**HTTPS:**
```bash
git clone https://github.com/WilqueMessias/To-Do-GP.git
cd To-Do-GP
```

**SSH:**
```bash
git clone git@github.com:WilqueMessias/To-Do-GP.git
cd To-Do-GP
```
- If you already have a local copy, update it with:
```bash
git pull
```

Next steps: see Execution below for running via Docker or local dev.

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

## License

MIT License. See [LICENSE](LICENSE).
<div align="center">
Technical Design by Wilque Messias © 2026.
</div>
