# To Do GP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Java: 17](https://img.shields.io/badge/Java-17-blue.svg)](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
[![React: 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Spring Boot: 3](https://img.shields.io/badge/Spring_Boot-3.x-green.svg)](https://spring.io/projects/spring-boot)

A professional task orchestration system with a focus on real-time feedback, deep audit trails, and cognitive ergonomics. **To Do GP** delivers a high-fidelity Kanban experience backed by a robust, transactional Java ecosystem.

[Technical Documentation](./TECHNICAL_DOCUMENTATION.md) | [Architecture](./TECHNICAL_DOCUMENTATION.md#architecture--design)

---

## Technical Highlights

**To Do GP** is engineered to handle complex workflows with features that go beyond a simple checklist:

*   **Audit Trail**: Every mutation (status change, priority shift, deadline renegotiation) is durably logged, providing a transparent history of the task's lifecycle.
*   **Intelligent History**: A resilient "Soft Delete" mechanism ensures data is never lost by accident. Tasks move to a managed history for review or immediate restoration.
*   **Checklist Progress**: Real-time progress aggregation where subtask completion status is reflected in the main task's visual indicators.
*   **Timezone-Aware Precision**: Specifically tuned for consistent date/time handling across different client locales, ensuring deadlines are absolute.
*   **Built-in Analytics**: Instant insights into Delivery Rate, Cycle Time (Creation to Completion), and Team Velocity.

## Stack Overview

### Backend (Robustness & Integrity)
- **Spring Boot 3 / Java 17**: Modern reactive base for the service layer.
- **Spring Data JPA**: Efficient ORM with transactional safety.
- **Swagger / OpenAPI**: Fully documented API surface for seamless integration.
- **H2 Database**: High-performance in-memory persistence (ready for Production DB migration).

### Frontend (Fluidity & UX)
- **Vite / React 18 / TypeScript**: Strict typing for runtime reliability.
- **dnd-kit Sortable**: Highly optimized drag-and-drop engine with adaptive sensors.
- **Tailwind CSS v4**: Advanced styling system for a premium, fast interface.
- **Lucide Icons**: Crisp, professional iconography.

---

## Quick Start

### 📦 Prerequisites
- **Docker** (Recommended) or **JDK 17+**, **Maven**, and **Node.js 18+**.

### 🚀 Automation Scripts
The easiest way to launch the ecosystem is using the included orchestrators:

- **Windows**: Run `start.bat`
- **Linux/POSIX**: Run `sh start.sh`

Navigate to `http://localhost:5173` for the UI and `http://localhost:8080/swagger-ui/index.html` for API exploration.

---

## Author & Contact

**Wilque Messias de Lima**  
*Software & Infrastructure Engineer*

- **GitHub**: [github.com/WilqueMessias/To-Do-GP](https://github.com/WilqueMessias/To-Do-GP)
- **LinkedIn**: [wilquemessias](https://br.linkedin.com/in/wilquemessias)
- **Email**: [wilquemessias@gmail.com](mailto:wilquemessias@gmail.com)

---
Developed by **Wilque Messias de Lima** © 2024. Project licensed under **MIT**.
