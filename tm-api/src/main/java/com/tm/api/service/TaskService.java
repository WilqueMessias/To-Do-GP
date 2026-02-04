package com.tm.api.service;

import com.tm.api.dto.TaskDTO;
import com.tm.api.exception.TaskNotFoundException;
import com.tm.api.mapper.TaskMapper;
import com.tm.api.model.Subtask;
import com.tm.api.model.Task;
import com.tm.api.model.TaskStatus;
import com.tm.api.event.TaskAuditEvent;
import com.tm.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.micrometer.core.instrument.MeterRegistry;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final MeterRegistry meterRegistry;
    private final TaskMapper taskMapper;

    public Page<TaskDTO> findAll(TaskStatus status, Pageable pageable) {
        log.info("Fetching paginated tasks with status: {}", status != null ? status : "ALL");
        Page<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByStatus(status, pageable);
        } else {
            tasks = taskRepository.findAll(pageable);
        }
        return tasks.map(taskMapper::toDTO);
    }

    public TaskDTO findById(UUID id) {
        log.debug("Finding task by id: {}", id);
        return taskRepository.findById(id)
                .map(taskMapper::toDTO)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }

    @Transactional
    public TaskDTO create(TaskDTO dto) {
        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .priority(dto.getPriority() != null ? dto.getPriority() : com.tm.api.model.Priority.LOW)
                .dueDate(dto.getDueDate())
                .important(dto.getImportant() != null ? dto.getImportant() : false)
                .reminderEnabled(dto.getReminderEnabled() != null ? dto.getReminderEnabled() : false)
                .reminderTime(dto.getReminderTime())
                .build();

        if (dto.getStatus() == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }

        if (dto.getSubtasks() != null) {
            List<Subtask> subtasks = dto.getSubtasks().stream()
                    .map(s -> Subtask.builder()
                            .title(s.getTitle())
                            .completed(s.isCompleted())
                            .task(task)
                            .build())
                    .collect(Collectors.toList());
            task.setSubtasks(subtasks);
        }

        Task savedTask = taskRepository.save(task);
        eventPublisher
                .publishEvent(new TaskAuditEvent(this, savedTask, Map.of(), Map.of("status", savedTask.getStatus())));

        meterRegistry.counter("tasks.created").increment();

        return taskMapper.toDTO(savedTask);
    }

    @Transactional
    public TaskDTO update(UUID id, TaskDTO dto) {
        log.info("Updating task id: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));

        TaskStatus oldStatus = task.getStatus();

        Map<String, Object> oldValues = new java.util.HashMap<>();
        Map<String, Object> newValues = new java.util.HashMap<>();

        if (dto.getTitle() != null && !task.getTitle().equals(dto.getTitle())) {
            oldValues.put("título", task.getTitle());
            task.setTitle(dto.getTitle());
            newValues.put("título", task.getTitle());
        }

        if (dto.getDescription() != null
                && (task.getDescription() == null || !task.getDescription().equals(dto.getDescription()))) {
            oldValues.put("descrição", task.getDescription());
            task.setDescription(dto.getDescription());
            newValues.put("descrição", task.getDescription());
        }

        if (dto.getPriority() != null && task.getPriority() != dto.getPriority()) {
            oldValues.put("prioridade", task.getPriority());
            task.setPriority(dto.getPriority());
            newValues.put("prioridade", task.getPriority());
        }

        if (dto.getDueDate() != null && (task.getDueDate() == null || !task.getDueDate().equals(dto.getDueDate()))) {
            oldValues.put("prazo", task.getDueDate());
            task.setDueDate(dto.getDueDate());
            newValues.put("prazo", task.getDueDate());
        }

        if (dto.getImportant() != null && task.isImportant() != dto.getImportant()) {
            oldValues.put("importância", task.isImportant());
            task.setImportant(dto.getImportant());
            newValues.put("importância", task.isImportant());
        }

        if (dto.getReminderEnabled() != null && task.isReminderEnabled() != dto.getReminderEnabled()) {
            oldValues.put("lembrete", task.isReminderEnabled());
            task.setReminderEnabled(dto.getReminderEnabled());
            newValues.put("lembrete", task.isReminderEnabled());
        }

        if (dto.getReminderTime() != null && !dto.getReminderTime().equals(task.getReminderTime())) {
            task.setReminderTime(dto.getReminderTime());
        }

        if (dto.getStatus() != null && oldStatus != dto.getStatus()) {
            oldValues.put("status", oldStatus);
            task.transitionTo(dto.getStatus());
            newValues.put("status", task.getStatus());
        }

        if (dto.getSubtasks() != null) {
            List<Subtask> currentSubtasks = new java.util.ArrayList<>(task.getSubtasks());
            List<com.tm.api.dto.SubtaskDTO> newSubtasksDTO = dto.getSubtasks();

            // Find Added
            for (var subDTO : newSubtasksDTO) {
                boolean existsById = subDTO.getId() != null && currentSubtasks.stream()
                        .anyMatch(s -> s.getId() != null && s.getId().equals(subDTO.getId()));
                boolean existsByTitle = subDTO.getId() == null && currentSubtasks.stream()
                        .anyMatch(s -> s.getTitle() != null && s.getTitle().equals(subDTO.getTitle()));

                if (!existsById && !existsByTitle) {
                    newValues.put("subtask_added_" + subDTO.getTitle(), subDTO.getTitle());
                    oldValues.put("subtask_added_" + subDTO.getTitle(), null);
                }
            }

            // Find Removed and Changed
            for (Subtask sOld : currentSubtasks) {
                var matchingNew = newSubtasksDTO.stream()
                        .filter(n -> n.getId() != null && sOld.getId() != null && n.getId().equals(sOld.getId()))
                        .findFirst();

                if (matchingNew.isEmpty()) {
                    matchingNew = newSubtasksDTO.stream()
                            .filter(n -> n.getId() == null && sOld.getTitle() != null
                                    && sOld.getTitle().equals(n.getTitle()))
                            .findFirst();
                }

                if (matchingNew.isEmpty()) {
                    newValues.put("subtask_removed_" + sOld.getTitle(), null);
                    oldValues.put("subtask_removed_" + sOld.getTitle(), sOld.getTitle());
                } else {
                    var sNew = matchingNew.get();
                    if (sOld.isCompleted() != sNew.isCompleted()) {
                        String key = (sNew.isCompleted() ? "subtask_completed_" : "subtask_uncompleted_")
                                + sOld.getTitle();
                        newValues.put(key, sOld.getTitle());
                        oldValues.put(key, !sNew.isCompleted());
                    }
                    if (!sOld.getTitle().equals(sNew.getTitle())) {
                        String key = "subtask_renamed_" + sOld.getId();
                        newValues.put(key, sNew.getTitle());
                        oldValues.put(key, sOld.getTitle());
                    }
                }
            }

            // Sync database state
            task.getSubtasks().clear();
            task.getSubtasks().addAll(newSubtasksDTO.stream()
                    .map(s -> Subtask.builder()
                            .id(s.getId())
                            .title(s.getTitle())
                            .completed(s.isCompleted())
                            .task(task)
                            .build())
                    .collect(Collectors.toList()));
        }

        Task savedTask = taskRepository.save(task);

        if (!newValues.isEmpty()) {
            eventPublisher.publishEvent(new TaskAuditEvent(this, savedTask, oldValues, newValues));
        }

        if (savedTask.getStatus() == TaskStatus.DONE && oldStatus != TaskStatus.DONE) {
            meterRegistry.counter("tasks.completed").increment();
        }

        return taskMapper.toDTO(savedTask);
    }

    @Transactional
    public void delete(UUID id) {
        log.info("Deleting task id: {}", id);
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
        meterRegistry.counter("tasks.deleted").increment();
    }

    @Transactional
    public TaskDTO restore(UUID id) {
        log.info("Restoring task id: {}", id);
        int updated = taskRepository.restoreByIdNative(id);
        if (updated == 0) {
            throw new TaskNotFoundException("Could not restore task with id: " + id);
        }

        // Load the recently restored entity
        Task restoredTask = taskRepository.findByIdIncludeDeleted(id)
                .orElseThrow(() -> new TaskNotFoundException("Task restored but not found: " + id));

        // Publish event for activity log
        eventPublisher.publishEvent(new TaskAuditEvent(this, restoredTask,
                Map.of("deleted", true), Map.of("deleted", false)));

        return taskMapper.toDTO(restoredTask);
    }

    public List<TaskDTO> getHistory() {
        log.info("Fetching deleted tasks history");
        return taskRepository.findAllDeletedNative().stream()
                .map(taskMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void hardDelete(UUID id) {
        log.info("Permanently deleting task id: {}", id);
        // Manual Cascade for Native Delete
        try {
            // Check if table exists/handle safe delete if needed, but simple DELETE is
            // usually fine
            // Assuming notifications table check isn't needed if not present, but good to
            // add if schema has it
            // taskRepository.deleteNotificationsNative(id);

            taskRepository.deleteActivitiesNative(id);
            taskRepository.deleteSubtasksNative(id);
            taskRepository.deletePermanentlyNative(id);
        } catch (Exception e) {
            log.error("Failed to hard delete task {}", id, e);
            throw e;
        }
    }

    // Event-driven auditing replaces direct repository calls

    @Transactional
    public void restoreAllHistory() {
        log.info("Restoring all deleted tasks history");
        taskRepository.restoreAllDeletedNative();
    }

    @Transactional
    public void clearHistory() {
        log.info("Clearing all deleted tasks history permanently");
        // Cascade delete for all deleted tasks
        try {
            taskRepository.deleteAllDeletedActivitiesNative();
            taskRepository.deleteAllDeletedSubtasksNative();
            taskRepository.deleteAllDeletedNative();
        } catch (Exception e) {
            log.error("Failed to clear history", e);
            throw e;
        }
    }
}
