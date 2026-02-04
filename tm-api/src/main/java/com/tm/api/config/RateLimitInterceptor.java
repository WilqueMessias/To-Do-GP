package com.tm.api.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, UserRequestInfo> requestCounts = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 100;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String clientIp = request.getRemoteAddr();
        long currentTime = System.currentTimeMillis() / 60000; // Minute precision

        UserRequestInfo info = requestCounts.compute(clientIp, (key, val) -> {
            if (val == null || val.minute != currentTime) {
                return new UserRequestInfo(currentTime, new AtomicInteger(1));
            }
            val.count.incrementAndGet();
            return val;
        });

        if (info.count.get() > MAX_REQUESTS_PER_MINUTE) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests. Please try again in a minute.");
            return false;
        }

        return true;
    }

    private static class UserRequestInfo {
        long minute;
        AtomicInteger count;

        UserRequestInfo(long minute, AtomicInteger count) {
            this.minute = minute;
            this.count = count;
        }
    }
}
