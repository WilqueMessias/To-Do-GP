# Especificação Técnica de Arquitetura

<div align="center">

**[English version](ARCHITECTURE.md)** | **[Versão em Português](ARCHITECTURE.pt-BR.md)**

</div>

---

## Topologia do Sistema

O sistema é arquitetado como um **Monolito Distribuído**, enfatizando o isolamento de limites de componentes entre a camada de apresentação e o núcleo do domínio. A sincronização é estabelecida via uma interface RESTful estritamente tipada.

```mermaid
graph LR
    subgraph "Camada de Apresentação (React)"
        Store["State Hooks"]
        UI["Elementos React"]
        DND["Motor de Física (DnD)"]
    end

    subgraph "Camada de Aplicação (Spring Boot)"
        Controller["Adaptadores REST"]
        Service["Serviços de Domínio"]
        Repo["Portas de Persistência"]
        EventBus["Barramento de Eventos Interno"]
        Audit["Listener Assíncrono"]
    end

    subgraph "Infraestrutura"
        DB[("Banco de Dados H2")]
    end

    UI <--> Store
    Store <--> DND
    Store -- "DTO" --> Controller
    Controller <--> Service
    Service <--> Repo
    Service -- "Evento" --> EventBus
    EventBus -- "Assíncrono" --> Audit
    Audit -- "Log" --> Repo
    Repo <--> DB
```

---

## Esquema de Dados & Cardinalidade

A persistência é gerenciada via JPA/Hibernate, utilizando cardinalidade um-para-muitos para telemetria de sub-entidades (Tarefas para Subtarefas/Atividades).

```mermaid
erDiagram
    TASK ||--o{ SUBTASK : "agrega"
    TASK ||--o{ ACTIVITY : "audita"
    
    TASK {
        UUID id PK "Identificador Invariante"
        string title "Rótulo Primário"
        enum status "Cluster de Estado"
        datetime due_date "Limite Temporal"
        datetime created_at "Inicialização do Sistema"
        boolean deleted "Flag de Soft-Delete"
    }
    
    SUBTASK {
        UUID id PK
        string title "Conteúdo do Checklist"
        boolean completed "Flag de Estado"
        UUID task_id FK "Referência de Dono"
    }
    
    ACTIVITY {
        UUID id PK
        string message "Log Diferencial"
        datetime timestamp "Horizonte de Evento"
        UUID task_id FK "Contexto da Entidade"
    }
```

---

## Ciclo de Requisição (Create/Update)

```mermaid
sequenceDiagram
    participant UI as UI (React)
    participant API as API (Spring Boot)
    participant SVC as TaskService
    participant DB as Banco de Dados

    UI->>API: POST /tasks ou PUT /tasks/{id}
    API->>SVC: validação + mapeamento DTO
    SVC->>DB: salvar Task
    DB-->>SVC: entidade persistida
    SVC-->>API: TaskDTO
    API-->>UI: 201/200 + payload
```

---

## Fluxo de Auditoria (Assíncrono)

```mermaid
flowchart LR
    A[TaskService] -->|Publica TaskAuditEvent| B[Barramento de Eventos]
    B -->|Listener Assíncrono| C[Processador de Auditoria]
    C -->|Persistir Activity Log| D[(Banco de Dados)]
```

---

## Fluxo de Execução (Dev vs Prod)

```mermaid
flowchart TD
    Dev[Desenvolvimento Local] --> DevApi[Subir Spring Boot]
    Dev --> DevUi[Subir Vite Dev Server]
    DevApi --> DevDb[(Arquivo H2)]

    Prod[Docker Compose] --> ApiContainer[container tm-api]
    Prod --> UiContainer[container tm-ui]
    ApiContainer --> ProdDb[(Arquivo H2)]
    UiContainer --> ApiContainer
```

---

## Padrões de Engenharia Core

### 1. Auditoria Assíncrona (Não-Bloqueante)
Para desacoplar a vazão de negócios da latência de efeitos colaterais, implementamos uma trilha de auditoria assíncrona orientada a eventos.
1. **Emissão**: o `TaskService` publica um `TaskAuditEvent` após mudanças de estado bem-sucedidas.
2. **Processamento**: Uma thread secundária calcula o diferencial de campos (diff).
3. **Persistência**: O log de auditoria é persistido em uma transação separada para não bloquear a resposta ao usuário.

### 2. Design de Resiliência (Rate Limiting)
Proteção da topologia da API através de um **RateLimitInterceptor** customizado.
- **Mecanismo**: Contador de Janela Fixa calculado por endereço IP do cliente.
- **Proteção**: Respostas automáticas `429 Too Many Requests` quando os limites são excedidos para proteger os recursos do backend.

### 3. Observabilidade & Monitoramento de SLI
Integração com **Micrometer** para exposição de Indicadores de Nível de Serviço.
- **Métricas KPI**: rastreamento em tempo real de `tasks.created` e `tasks.completed`.
- **Telemetria de Saúde**: Sondagens de saúde especializadas que monitoram proporções críticas de dados (ex: tarefas atrasadas).

---

## Orquestração de Infraestrutura

O ciclo de vida de implantação é gerenciado via **Docker Compose**, utilizando dependências de verificação de saúde para garantir a inicialização estável dos serviços.
- **Performance**: A UI é servida através de um container Nginx alpine.
- **Estabilidade**: A inicialização baseada em condições garante que a UI só inicie após a API reportar status `healthy`.

---

## Pré-requisitos & Execução

- **Java 17** (Spring Boot)
- **Node 18** (Frontend)
- **Docker + Docker Compose** (execução recomendada)

**Execução rápida (Launchers Automatizados):**
- **Windows**: `start.bat`
- **Linux/Mac**: `start.sh`

Os launchers verificam automaticamente o ambiente Docker e orquestram o build.

**Execução manual:**
```bash
docker compose up -d --build
```
- **Interface**: [http://localhost](http://localhost)
- **Swagger**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## Decisões & Trade-offs

- **Monolito Distribuído**: reduz acoplamento entre camadas sem incorrer em overhead de microserviços.
- **Auditoria assíncrona**: reduz latência de resposta, com eventual consistência no log.
- **Rate limiting no edge da API**: proteção com limite por IP como heurística simples.

---

## Limitações Conhecidas

- **Arquivo H2**: adequado para desenvolvimento, não recomendado para produção.
- **Rate limit por IP**: não cobre cenários de NAT/Proxy com precisão fina.

---

## Próximos Passos

- Persistência externa (PostgreSQL) com migrações (Flyway).
- Tracing distribuído (OpenTelemetry) e métricas avançadas.
- Política de rate limit por token/usuário.

---
Arquitetura Técnica por Wilque Messias © 2026.
