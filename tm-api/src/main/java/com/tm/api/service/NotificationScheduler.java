package com.tm.api.service;

import com.tm.api.model.Activity;
import com.tm.api.model.Task;
import com.tm.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationScheduler {

    private final TaskRepository taskRepository;

    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void checkReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMinuteAgo = now.minusMinutes(1);

        log.debug("Checking for reminders between {} and {}", oneMinuteAgo, now);

        // Find tasks with reminders due in the last minute that haven't been completed
        // This is a simplified version. In a real app, we'd track if a notification was
        // already sent.
        List<Task> tasksToNotify = taskRepository.findAll().stream()
                .filter(t -> t.isReminderEnabled()
                        && t.getReminderTime() != null
                        && t.getReminderTime().isAfter(oneMinuteAgo)
                        && t.getReminderTime().isBefore(now)
                        && !t.getStatus().name().equals("DONE"))
                .toList();

        for (Task task : tasksToNotify) {
            log.info("NOTIFICATION TRIGGERED for Task: {} ({})", task.getTitle(), task.getId());

            task.getActivities().add(Activity.builder()
                    .message("NOTIFICAÇÃO DISPARADA: Lembrete enviado ao usuário.")
                    .task(task)
                    .build());

            // In a real application, we would send a WebSocket message or Push Notification
            // here.
        }
    }
}
