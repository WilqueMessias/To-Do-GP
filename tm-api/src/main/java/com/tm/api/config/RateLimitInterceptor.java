package com.tm.api.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private final Map<String, RequestCounter> clientRequests = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String clientIp = request.getRemoteAddr();
        RequestCounter counter = clientRequests.computeIfAbsent(clientIp, k -> new RequestCounter());

        if (counter.incrementAndCheckLimit()) {
            return true;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.getWriter().write("Too many requests. Please try again in a minute.");
        return false;
    }

    private static class RequestCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        private long lastResetTime = System.currentTimeMillis();

        public synchronized boolean incrementAndCheckLimit() {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastResetTime > TimeUnit.MINUTES.toMillis(1)) {
                count.set(0);
                lastResetTime = currentTime;
            }

            return count.incrementAndGet() <= MAX_REQUESTS_PER_MINUTE;
        }
    }
}
