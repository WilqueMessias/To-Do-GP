package com.tm.api.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;

@Component
public class RequestLoggingFilter implements Filter {
    private final String LOG_FILE = "d:/GP/requests.log";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        String logEntry = String.format("[%s] %s %s\n", LocalDateTime.now(), req.getMethod(), req.getRequestURI());
        try {
            Files.write(Paths.get(LOG_FILE), logEntry.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception e) {
            // Ignorar erros de escrita
        }
        System.out.println("\n#########################################");
        System.out.println(">>> [QA NEURAL FIXER] DETECTED URI: " + req.getRequestURI());
        System.out.println(">>> METHOD: " + req.getMethod());
        System.out.println("#########################################\n");
        chain.doFilter(request, response);
    }
}
