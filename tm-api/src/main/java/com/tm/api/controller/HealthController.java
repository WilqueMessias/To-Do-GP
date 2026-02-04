package com.tm.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Actuator", description = "System health and operational monitoring")
public class HealthController {

    @Operation(summary = "Check system health", description = "Returns UP if the Spring Boot context is healthy and responsive.")
    @GetMapping("/health")
    public String health() {
        return "UP";
    }
}
