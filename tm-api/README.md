# Task Manager API (tm-api)

Backend service for the To Do GP system, built with Spring Boot.

## Technical Specifications

- **Runtime**: Java 17
- **Framework**: Spring Boot 3.4.1
- **Security**: Request-level Rate Limiting (Interceptor pattern)
- **Monitoring**: Spring Boot Actuator with custom Health Indicators
- **Auditing**: Asynchronous Event-Driven logging using Spring Events
- **Documentation**: OpenAPI 3.0 / Swagger UI

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
