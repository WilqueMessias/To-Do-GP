package com.tm.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Component
public class EndpointListingRunner implements CommandLineRunner {
    private final ApplicationContext applicationContext;

    public EndpointListingRunner(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(String... args) {
        System.out.println("=========================================");
        System.out.println(">>> [QA DIAGNOSTIC] REGISTERED ENDPOINTS:");
        applicationContext.getBean(RequestMappingHandlerMapping.class)
            .getHandlerMethods().forEach((key, value) -> System.out.println(key + " -> " + value));
        System.out.println("=========================================");
    }
}
