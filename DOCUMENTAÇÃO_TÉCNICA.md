# DOCUMENTAÇÃO TÉCNICA - TASK MANAGER (KANBAN)

Esta documentação detalha a arquitetura, endpoints e decisões técnicas do projeto, em conformidade com o guia de especificação oficial.

---

## 🏗️ 1. Arquitetura do Sistema
O sistema segue o padrão de arquitetura em camadas (Layered Architecture) para garantir escalabilidade e manutenção.

### Backend (Java/Spring Boot)
- **Controller**: Gerenciamento de rotas e Status Codes HTTP.
- **Service**: Regras de negócio e orquestração de dados.
- **Repository**: Interface de persistência com Spring Data JPA.
- **DTOs**: Objetos de transferência para evitar exposição de entidades JPA.
- **Exception Handler**: Tratamento global de erros para respostas amigáveis.

### Frontend (React/TypeScript)
- **Componentização**: Interface modular (KanbanBoard, Column, TaskCard, TaskForm).
- **Service Layer**: Abstração de chamadas HTTP via Axios.
- **UX/UI**: Estilização com Tailwind CSS v4 e Drag & Drop com `@dnd-kit`.

---

## 📡 2. Endpoints da API (RESTful)

Base URL: `http://localhost:8080/tasks`

| Método | Endpoint | Descrição | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Lista tarefas (opcional: `?status=TODO`) | 200 |
| **GET** | `/tasks/{id}` | Busca uma tarefa específica por UUID | 200, 404 |
| **POST** | `/tasks` | Cria uma nova tarefa | 201, 400 |
| **PUT** | `/tasks/{id}` | Atualiza título, descrição ou status | 200, 404 |
| **DELETE** | `/tasks/{id}` | Remove uma tarefa (física) | 204, 404 |
| **GET** | `/health` | Verificação de integridade do sistema | 200 |

---

## 🗄️ 3. Modelo de Dados (JPA/H2)

Tabela: `TASKS`
- `id`: `UUID` (Gerado automaticamente)
- `title`: `VARCHAR(255)` (Obrigatório)
- `description`: `TEXT`
- `status`: `ENUM` (`TODO`, `DOING`, `DONE`)
- `priority`: `ENUM` (`LOW`, `MEDIUM`, `HIGH`)
- `due_date`: `TIMESTAMP` (Obrigatório)
- `created_at`: `TIMESTAMP` (Gerado automaticamente)

---

## 🛠️ 4. Guia de Execução

1.  **Requisitos**: Java 17, Node.js e Maven.
2.  **Execução Rápida**: Rode o arquivo `start.bat` na raiz do projeto.
3.  **Ambiente**:
    - Frontend: `http://localhost:5173`
    - Backend: `http://localhost:8080`
    - Swagger: `http://localhost:8080/swagger-ui.html`
    - Banco H2: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:tmdb`)

---

## ✅ 5. Certificação de Requisitos
- [x] CRUD completo de tarefas.
- [x] Filtragem por status na listagem.
- [x] Validação de campos obrigatórios.
- [x] Interface Kanban com Drag & Drop.
- [x] Documentação Swagger e Testes Unitários.
- [x] Docker-ready (opcional).

---
**Status:** Projeto Finalizado e Homologado ✅
