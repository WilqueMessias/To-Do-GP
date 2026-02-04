package com.tm.api.config;

import com.tm.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TaskHealthIndicator implements HealthIndicator {

    private final TaskRepository taskRepository;

    @Override
    public Health health() {
        // Business logic check: If more than 50% of tasks are overdue, the "business
        // health" is marked as DOWN
        long totalTasks = taskRepository.count();
        if (totalTasks == 0)
            return Health.up().withDetail("tasks", 0).build();

        long overdueTasks = taskRepository.findAll().stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDateTime.now())
                        && !"DONE".equals(t.getStatus().name()))
                .count();

        double overdueRatio = (double) overdueTasks / totalTasks;

        if (overdueRatio > 0.5) {
            return Health.down()
                    .withDetail("reason", "Critical amount of overdue tasks")
                    .withDetail("overduePercentage", String.format("%.2f%%", overdueRatio * 100))
                    .build();
        }

        return Health.up()
                .withDetail("totalTasks", totalTasks)
                .withDetail("overdueTasks", overdueTasks)
                .build();
    }
}
