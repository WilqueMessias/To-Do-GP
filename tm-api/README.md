# Task Manager API (tm-api)

Backend service for the To Do GP system, built with Spring Boot.

## Technical Specifications

- **Runtime**: Java 17
- **Framework**: Spring Boot 3.4.1
- **Security**: Request-level Rate Limiting (Interceptor pattern)
- **Monitoring**: Spring Boot Actuator with custom Health Indicators
- **Auditing**: Asynchronous Event-Driven logging using Spring Events
- **Documentation**: OpenAPI 3.0 / Swagger UI

## Prerequisites

- Java 17 (JDK)
- Maven 3.9+

## Environment Variables (Optional)

- `SERVER_PORT` (default: `8080`)
- `SPRING_DATASOURCE_URL` (default: `jdbc:h2:file:./data/tmdb`)
- `SPRING_DATASOURCE_USERNAME` (default: `sa`)
- `SPRING_DATASOURCE_PASSWORD` (default: empty)

## Local Execution

```bash
mvn clean spring-boot:run
```

## Docker Execution

Run from the repository root:
```bash
docker-compose up -d --build
```

## API Access

When running locally or via Docker:
- **Base URL**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **Health Check**: `http://localhost:8080/actuator/health`

## Automated Testing

Execute tests via Maven Wrapper:
```bash
./mvnw test
```
Includes Unit Tests for service layer and Integration Tests for API endpoints.
