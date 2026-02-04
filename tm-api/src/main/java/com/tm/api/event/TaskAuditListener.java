package com.tm.api.event;

import com.tm.api.model.Activity;
import com.tm.api.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskAuditListener {

    private final ActivityRepository activityRepository;

    @Async
    @EventListener
    @Transactional
    public void handleTaskAuditEvent(TaskAuditEvent event) {
        log.info("Asynchronously processing audit event for task: {}", event.getTask().getId());

        // Dynamic diffing or simple message building
        event.getNewValues().forEach((field, newValue) -> {
            Object oldValue = event.getOldValues().get(field);
            String message = String.format("Campo '%s' alterado de [%s] para [%s]", field, oldValue, newValue);

            Activity activity = Activity.builder()
                    .task(event.getTask())
                    .message(message)
                    .build();
            activityRepository.save(activity);
        });
    }
}
