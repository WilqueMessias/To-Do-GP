package com.tm.api.event;

import com.tm.api.model.Task;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;

@Getter
public class TaskAuditEvent extends ApplicationEvent {
    private final Task task;
    private final Map<String, Object> oldValues;
    private final Map<String, Object> newValues;

    public TaskAuditEvent(Object source, Task task, Map<String, Object> oldValues, Map<String, Object> newValues) {
        super(source);
        this.task = task;
        this.oldValues = oldValues;
        this.newValues = newValues;
    }
}
