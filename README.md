# To Do GP

[![Maintained by: Wilque Messias](https://img.shields.io/badge/Maintained%20by-Wilque%20Messias-blue.svg)](https://github.com/WilqueMessias)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Docker: Ready](https://img.shields.io/badge/Docker-Ready-blue.svg?logo=docker)](https://www.docker.com/)

**To Do GP** is a professional task management ecosystem designed for engineers and project leads. It combines a high-performance Java backend with a fluid, reactive TypeScript frontend to deliver a superior Kanban experience focused on data integrity and real-time analytics.

---

## 🛠️ Comprehensive Tech Stack

### Backend Tier
*   **Runtime**: Java 17 (OpenJDK)
*   **Framework**: Spring Boot 3.4.1
*   **Data Access**: Spring Data JPA / Hibernate
*   **Database**: H2 (In-memory, persistent data schemas)
*   **API Documentation**: Swagger UI / OpenAPI 3.0
*   **Utilities**: Project Lombok (Boilerplate reduction), Jakarta Validation
*   **Logging**: SLF4J / Logback

### Frontend Tier
*   **Build Tool**: Vite (Ultra-fast HMR)
*   **Library**: React 18
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS v4 (Modern JIT engine)
*   **Drag & Drop**: @dnd-kit (Optimized for performance and accessibility)
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

### Infrastructure & DevOps
*   **Containerization**: Docker & Docker Compose
*   **Package Managers**: Maven (Backend) / NPM (Frontend)
*   **Automation**: PowerShell / Batch orchestrators

---

## 🚀 Deployment (Docker Focus)

The recommended way to run **To Do GP** in a production-like environment is via **Docker Compose**. This ensures all services are correctly networked and volume-mapped for data persistence.

### 1. Standard Docker Launch
From the root directory, execute:
```bash
docker-compose up --build
```
This command orchestrates:
-   **tm-api**: Compiles and runs the Spring Boot service on port `8080`.
-   **tm-ui**: Builds the React application and serves it via Nginx on port `80`.

### 2. High-Level Automation
If you are on Windows, you can use the interactive launcher:
1.  Run `start.bat`.
2.  Select **Option [1] CONTAINERIZED**.
This will automatically handle build synchronization and deployment.

### 3. Accessing the System
-   **User Interface**: [http://localhost](http://localhost) (or `http://localhost:5173` in Dev Mode)
-   **REST API**: [http://localhost:8080/tasks](http://localhost:8080/tasks)
-   **API Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 📖 How to Use the System

**To Do GP** follows a standard Kanban methodology enhanced by analytical features.

### 1. Task Management
-   **Create**: Click the "Add Task" button. You can define title, description, priority, and due dates.
-   **Drag & Drop**: Effortlessly move cards between columns (**To Do**, **In Progress**, **Done**).
-   **Subtasks**: Break down tasks into smaller steps. The main card's progress bar will update automatically as you check them off.

### 2. Advanced Controls
-   **Importance**: Star a task to pin it as a high-priority item.
-   **Activity Log**: Click on a task to view its history. Every status change and update is recorded in the **Activity Trail**.
-   **Soft Delete**: When you delete a task, it moves to the **History Panel**. Access it via the "History" button to restore or permanently purge data.

### 3. Monitoring Productivity
-   Use the **Analytics Panel** at the top to track:
    -   **Delivery Rate**: Percentage of successfully closed tasks.
    -   **Average Cycle Time**: How long a task takes from creation to completion.
    -   **Checklist Efficiency**: Your subtask completion ratio.
    -   **Velocity**: Number of tasks finished in the last 7 days.

---

## 👨‍💻 Author & Credits

**To Do GP** was architected and developed by **Wilque Messias de Lima**.

-   **Repository**: [github.com/WilqueMessias/To-Do-GP](https://github.com/WilqueMessias/To-Do-GP)
-   **LinkedIn**: [Wilque Messias](https://br.linkedin.com/in/wilquemessias)
-   **Email**: [wilquemessias@gmail.com](mailto:wilquemessias@gmail.com)

---
Developed by **Wilque Messias de Lima** © 2024. Licensed under **MIT**.
