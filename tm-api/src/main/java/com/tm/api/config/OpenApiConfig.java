package com.tm.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("To Do GP: Enterprise Task Management API")
                        .version("2.0.0")
                        .description(
                                "High-performance task management engine featuring a **Differential Audit Engine**, " +
                                        "**Logical Data Lifecycle (Soft-Delete)**, and **Optimistic Synchronization Support**. "
                                        +
                                        "\n\nArchitected for 100% traceability and sub-millisecond state transitions.")
                        .contact(new Contact()
                                .name("Wilque Messias")
                                .url("https://br.linkedin.com/in/wilquemessias"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
