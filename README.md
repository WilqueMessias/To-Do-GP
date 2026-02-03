# Task Manager (Kanban)

A modern Task Management system with a Kanban board.

---

### 📖 [Documentação Técnica do Sistema](./DOCUMENTAÇÃO_TÉCNICA.md)

---

## Tech Stack

- **Backend**: Java 17, Spring Boot, Spring Data JPA, H2, Lombok, Swagger.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, dnd-kit.

## Como Rodar a Aplicação

A forma mais fácil de rodar o projeto é usando o script automatizado que criei:

1. Localize o arquivo `start.bat` na raiz do projeto.
2. Dê um clique duplo nele.
3. Escolha entre rodar via **Docker** (opção 1) ou **Modo Desenvolvimento** (opção 2).

### Pré-requisitos
- Se usar **Docker**: Docker Desktop instalado.
- Se usar **Modo Desenvolvimento**: JDK 17, Maven e Node.js 18+ instalados.

---

### Execução Manual (Se preferir)

#### Rodando o Backend (Java)

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
