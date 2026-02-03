package com.tm.api.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class RequestLoggingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        System.out.println(">>> [QA DIAGNOSTIC] Request URI: " + req.getRequestURI() + " | Method: " + req.getMethod());
        chain.doFilter(request, response);
    }
}
