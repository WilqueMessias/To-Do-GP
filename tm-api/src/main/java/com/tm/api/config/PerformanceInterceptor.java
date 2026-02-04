package com.tm.api.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class PerformanceInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
            Exception ex) {
        long startTime = (long) request.getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;
        log.info("API Request: {} {} | Status: {} | Duration: {}ms",
                request.getMethod(), request.getRequestURI(), response.getStatus(), duration);
    }
}
