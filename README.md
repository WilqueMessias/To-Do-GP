# Task Manager (Kanban)

A modern Task Management system with a Kanban board.

## Tech Stack

- **Backend**: Java 17, Spring Boot, Spring Data JPA, H2, Lombok, Swagger.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, dnd-kit.

## Getting Started

### Prerequisites

- JDK 17+
- Maven 3+
- Node.js 18+

### Running the Backend

1. Navigate to `tm-api`.
2. Run `mvn spring-boot:run`.
3. API will be available at `http://localhost:8080`.
4. Swagger UI: `http://localhost:8080/swagger-ui/index.html`.

### Running the Frontend

1. Navigate to `tm-ui`.
2. Run `npm install`.
3. Run `npm run dev`.
4. App will be available at `http://localhost:5173`.

## Features

- [x] Create, Read, Update, and Delete Tasks.
- [x] Kanban Board with Drag & Drop.
- [x] Status and Priority filtering (API level).
- [x] Responsive UI with Tailwind CSS.
- [x] Input validation on both ends.
