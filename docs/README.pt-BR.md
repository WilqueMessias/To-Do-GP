# To Do GP

![System Hero](./assets/hero.png)

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/WilqueMessias)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://br.linkedin.com/in/wilquemessias)

**[Read in English](../README.md)** | **[Leia em Português](README.pt-BR.md)**

---

**[Especificação Técnica](./ARCHITECTURE.pt-BR.md)** · **[Backend API](../tm-api/README.md)** · **[Frontend SPA](../tm-ui/README.md)**

</div>

---

## Visão Geral

O **To Do GP** é um sistema de gerenciamento de tarefas desacoplado, projetado com **Java 17 (Spring Boot 3.2.2)** e **TypeScript (React 19)**. A arquitetura utiliza propagação de eventos assíncronos e auditoria não bloqueante com limites orientados ao domínio para preservar a integridade dos dados.

---

## Core Arquitetônico

O sistema utiliza uma topologia **Monolito Distribuído**, estabelecendo um limite claro entre o gerenciamento de estado transacional e a interface de usuário reativa.

- **Serviço Backend**: Orquestra invariantes de domínio, logs de atividade imutáveis e persistência em conformidade com ACID.
- **SPA Frontend**: Gerencia reconciliação otimista, interações baseadas em física e agregação analítica em tempo real.

---

## Destaques de Engenharia

- **Auditoria Orientada a Eventos**: Rastreamento de atividades assíncrono baseado em diferenciais (diff) via eventos Spring e isolamento de thread-pool (`@Async`).
- **Resiliência de API**: Implementação de um **RateLimitInterceptor** customizado (Contador de Janela Fixa) para proteger os recursos do sistema contra exaustão.
- **Observabilidade Profunda**: Integração total com **Micrometer** para rastreamento de KPIs de negócio e sondas de saúde especializadas via **Spring Actuator**.
- **Orquestração de Infraestrutura**: Configuração Docker pronta para produção com ciclos de verificação de saúde internos para estabilização de serviços.

---

## Pilha Tecnológica

| Componente | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Runtime** | Java 17 / Node 18 | Estabilidade e performance padrão da indústria. |
| **Frameworks** | Spring Boot / React | Ecossistema comum para backend e UI baseada em componentes. |
| **Segurança** | RateLimit Interceptor | Proteção nativa contra exaustão de recursos e força bruta. |
| **Observabilidade** | Micrometer | Monitoramento de SLI/SLO e telemetria. |
| **Infraestrutura** | Docker / Compose | Multi-stage builds e orquestração containerizada. |

---

## Pré-requisitos

- **Java 17** (JDK)
- **Maven** (para desenvolvimento local)
- **Node 18**
 - **Docker + Docker Compose** (para execução em produção)
 - **Windows**: Docker Desktop
	 - **Home**: requer backend **WSL2**
	 - **Pro/Enterprise**: **WSL2** recomendado; **Hyper‑V** opcional

---

## Requisitos do Host ^& Compatibilidade

Ambiente alvo: estações de trabalho 64‑bits capazes de executar Docker Desktop/Engine.

**Sistemas operacionais suportados (runtime Docker):**
- Windows 10/11 64‑bits com Docker Desktop
	- Home: Docker Desktop com backend **WSL2** (obrigatório)
	- Pro/Enterprise: Docker Desktop com backend **WSL2** (recomendado) ou engine **Hyper‑V**
- Linux (x86_64) com Docker Engine 24+ e Docker Compose v2
- macOS 12+ (Apple Silicon ou Intel) com Docker Desktop

**Perfil mínimo de hardware (build + runtime em Docker):**
- CPU: 64‑bits com 2 núcleos (x86_64 ou Apple Silicon)
- Memória: 8 GB de RAM
- Disco: ~10 GB livres (imagens + caches de build)

**Desenvolvimento local sem Docker (Execução → Desenvolvimento):**
- Mesmo perfil de CPU/memória indicado acima, mais:
	- JDK 17 e Maven 3.9+
	- Node.js 18+ e npm

Notas:
- O tempo de build é limitado principalmente por CPU, I/O de disco e rede ao baixar dependências e imagens.
- O build do frontend usa Vite e se beneficia de bom desempenho single‑core e SSD.

---

## Configuração WSL2 no Windows (para Docker)

O Docker Desktop no Windows utiliza o backend WSL2. Garanta que o WSL2 esteja habilitado antes de executar os containers.

**Habilitar WSL2 (Windows 10/11):**
```powershell
wsl --install
wsl --version
```
Se `wsl --install` não estiver disponível, siga o guia oficial da Microsoft: https://learn.microsoft.com/windows/wsl/install

**Configuração no Docker Desktop:**
- Instale o Docker Desktop e habilite "Use the WSL 2 based engine".
- Instale uma distribuição Linux (ex.: Ubuntu) pela Microsoft Store.
- No Docker Desktop: Settings → Resources → WSL Integration → habilite sua distro.

Alternativa (Pro/Enterprise): você pode usar o engine baseado em **Hyper‑V** em vez do WSL2 (Settings → General → desmarque WSL 2 engine). O Compose v2 funciona em ambos os backends.

Após configurar o WSL2 e o Docker Desktop, siga para a seção Execução.

---

## Clonar o Repositório

Use o Git para baixar o projeto localmente.

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
- Se você já possui uma cópia local, atualize com:
```bash
git pull
```

Próximos passos: veja a seção Execução abaixo para rodar via Docker ou ambiente local.

---

## Variáveis de Ambiente (Opcional)

**Backend (Spring Boot):**
- `SERVER_PORT` (padrão: `8080`)
- `SPRING_DATASOURCE_URL` (padrão: `jdbc:h2:file:./data/tmdb`)
- `SPRING_DATASOURCE_USERNAME` (padrão: `sa`)
- `SPRING_DATASOURCE_PASSWORD` (padrão: vazio)

**Frontend:**
- `VITE_API_BASE_URL` (padrão: `http://localhost:8080`)
	- Exemplo: copie [tm-ui/.env.example](../tm-ui/.env.example) para `tm-ui/.env`

## Execução

### 1) Produção (Docker Compose)
**Inicialização rápida (scripts):**
- Windows: `start.bat`
- Linux/Mac: `start.sh`

**Execução manual:**
```bash
docker-compose up -d --build
```
- **Interface**: [http://localhost](http://localhost)
- **Especificação API**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

### 2) Desenvolvimento (Local)
**Instalar dependências do frontend:**
```bash
cd tm-ui
npm install
```

**Subir backend:**
```bash
cd tm-api
mvn clean spring-boot:run
```

**Subir frontend:**
```bash
cd tm-ui
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:8080](http://localhost:8080)

---

## Portas

- **Frontend (dev)**: `5173`
- **Frontend (prod)**: `80`
- **Backend API**: `8080`

---

## Testes

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

## Solução de Problemas

- **Conflito de portas**: finalize processos em `8080` ou `5173` e tente novamente.
- **Build Docker lento**: execute `docker system prune` e reconstrua.
- **API sem health**: verifique [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health).

---

## Análises & SLIs

- **Velocidade do Kanban**: Cálculo de vazão (throughput) de tarefas finalizadas em uma janela de 168 horas.
- **Tempo de Ciclo (Cycle Time)**: Análise estatística do tempo de liderança desde a inicialização do registro até o estado terminal.
- **Análise de Distribuição**: Visualização percentual de tarefas distribuídas entre clusters de estado.

---

## Licença

Licença MIT. Veja [LICENSE](../LICENSE).
<div align="center">
Design Técnico por Wilque Messias © 2026.
</div>
