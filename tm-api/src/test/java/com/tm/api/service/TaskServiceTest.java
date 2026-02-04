package com.tm.api.service;

import com.tm.api.dto.TaskDTO;
import com.tm.api.event.TaskAuditEvent;
import com.tm.api.mapper.TaskMapper;
import com.tm.api.model.Priority;
import com.tm.api.model.Task;
import com.tm.api.model.TaskStatus;
import com.tm.api.repository.TaskRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private MeterRegistry meterRegistry;
    @Mock
    private TaskMapper taskMapper;
    @Mock
    private Counter counter;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;
    private UUID taskId;

    @BeforeEach
    void setUp() {
        taskId = UUID.randomUUID();
        sampleTask = Task.builder()
                .id(taskId)
                .title("Original Title")
                .status(TaskStatus.TODO)
                .priority(Priority.MEDIUM)
                .dueDate(LocalDateTime.now().plusDays(1))
                .build();

        lenient().when(meterRegistry.counter(anyString())).thenReturn(counter);
    }

    @Test
    void whenUpdateTitle_thenPublishAuditEventWithDifferences() {
        // Arrange
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskDTO updateDTO = TaskDTO.builder()
                .title("New Title")
                .build();

        // Act
        taskService.update(taskId, updateDTO);

        // Assert
        ArgumentCaptor<TaskAuditEvent> eventCaptor = ArgumentCaptor.forClass(TaskAuditEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        TaskAuditEvent event = eventCaptor.getValue();
        assertEquals("Original Title", event.getOldValues().get("título"));
        assertEquals("New Title", event.getNewValues().get("título"));
    }

    @Test
    void whenUpdateStatus_thenPublishAuditEventAndIncrementCounter() {
        // Arrange
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskDTO updateDTO = TaskDTO.builder()
                .status(TaskStatus.DONE)
                .build();

        // Act
        taskService.update(taskId, updateDTO);

        // Assert
        ArgumentCaptor<TaskAuditEvent> eventCaptor = ArgumentCaptor.forClass(TaskAuditEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        TaskAuditEvent event = eventCaptor.getValue();
        assertEquals(TaskStatus.TODO, event.getOldValues().get("status"));
        assertEquals(TaskStatus.DONE, event.getNewValues().get("status"));

        verify(counter).increment(); // tasks.completed counter
    }

    @Test
    void whenUpdateMultipleFields_thenIncludeAllInAuditEvent() {
        // Arrange
        when(taskRepository.findById(taskId)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskDTO updateDTO = TaskDTO.builder()
                .title("Multi Update")
                .priority(Priority.HIGH)
                .status(TaskStatus.DOING)
                .build();

        // Act
        taskService.update(taskId, updateDTO);

        // Assert
        ArgumentCaptor<TaskAuditEvent> eventCaptor = ArgumentCaptor.forClass(TaskAuditEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        TaskAuditEvent event = eventCaptor.getValue();
        assertTrue(event.getNewValues().containsKey("título"));
        assertTrue(event.getNewValues().containsKey("prioridade"));
        assertTrue(event.getNewValues().containsKey("status"));
    }
}
