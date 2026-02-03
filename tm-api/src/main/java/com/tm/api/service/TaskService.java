package com.tm.api.service;

import com.tm.api.dto.ActivityDTO;
import com.tm.api.dto.SubtaskDTO;
import com.tm.api.dto.TaskDTO;
import com.tm.api.exception.TaskNotFoundException;
import com.tm.api.model.Activity;
import com.tm.api.model.Subtask;
import com.tm.api.model.Task;
import com.tm.api.model.TaskStatus;
import com.tm.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public Page<TaskDTO> findAll(TaskStatus status, Pageable pageable) {
        log.info("Fetching paginated tasks with status: {}", status != null ? status : "ALL");
        Page<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByStatus(status, pageable);
        } else {
            tasks = taskRepository.findAll(pageable);
        }
        return tasks.map(this::toDTO);
    }

    public TaskDTO findById(UUID id) {
        log.debug("Finding task by id: {}", id);
        return taskRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
    }

    @Transactional
    public TaskDTO create(TaskDTO dto) {
        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .priority(dto.getPriority())
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

        addActivity(task, "Tarefa criada com o status " + task.getStatus());

        return toDTO(taskRepository.save(task));
    }

    @Transactional
    public TaskDTO update(UUID id, TaskDTO dto) {
        log.info("Updating task id: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));

        TaskStatus oldStatus = task.getStatus();

        if (dto.getTitle() != null && !task.getTitle().equals(dto.getTitle())) {
            addActivity(task, "Título alterado: " + task.getTitle() + " -> " + dto.getTitle());
            task.setTitle(dto.getTitle());
        }

        if (dto.getDescription() != null) {
            String newDesc = dto.getDescription();
            if (task.getDescription() != null && !task.getDescription().equals(newDesc)) {
                addActivity(task, "Descrição técnica atualizada.");
                task.setDescription(newDesc);
            } else if (task.getDescription() == null && !newDesc.isBlank()) {
                addActivity(task, "Descrição técnica adicionada.");
                task.setDescription(newDesc);
            }
        }

        if (dto.getPriority() != null && task.getPriority() != dto.getPriority()) {
            addActivity(task, "Prioridade alterada: " + task.getPriority() + " -> " + dto.getPriority());
            task.setPriority(dto.getPriority());
        }

        if (dto.getDueDate() != null) {
            LocalDateTime newDate = dto.getDueDate();
            if (task.getDueDate() != null && !task.getDueDate().equals(newDate)) {
                addActivity(task, "Prazo renegociado.");
                task.setDueDate(newDate);
            } else if (task.getDueDate() == null) {
                addActivity(task, "Prazo definido.");
                task.setDueDate(newDate);
            }
        }

        // Handle boolean primitive (boolean in DTO, but we need to check if it was
        // actually in the JSON)
        // Note: For partial updates, it's better to use Boolean wrapper in DTO,
        // but here we can check if it differs from current to justify an update if it's
        // sent.
        // However, if it's ALWAYS sent as false by default in some clients, this is
        // risky.
        // Given TaskDTO.important is boolean, it defaults to false.
        // Special case: if important changed, update it.
        if (dto.getImportant() != null && task.isImportant() != dto.getImportant()) {
            addActivity(task, "Importância alterada: " + (dto.getImportant() ? "Alta/Estrela" : "Normal"));
            task.setImportant(dto.getImportant());
        }

        if (dto.getReminderEnabled() != null && task.isReminderEnabled() != dto.getReminderEnabled()) {
            addActivity(task, dto.getReminderEnabled() ? "Lembrete ativado para " + dto.getReminderTime()
                    : "Lembrete desativado.");
            task.setReminderEnabled(dto.getReminderEnabled());
        }

        if (dto.getReminderTime() != null && !dto.getReminderTime().equals(task.getReminderTime())) {
            task.setReminderTime(dto.getReminderTime());
        }

        if (dto.getStatus() != null) {
            task.setStatus(dto.getStatus());
            if (task.getStatus() == TaskStatus.DONE && oldStatus != TaskStatus.DONE) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (task.getStatus() != TaskStatus.DONE) {
                task.setCompletedAt(null);
            }

            if (oldStatus != task.getStatus()) {
                addActivity(task, "Status alterado de " + oldStatus + " para " + task.getStatus());
            }
        }

        if (dto.getSubtasks() != null && !dto.getSubtasks().isEmpty()) {
            // Log subtask completion changes
            dto.getSubtasks().forEach(sdto -> {
                task.getSubtasks().stream()
                        .filter(s -> s.getTitle().trim().equalsIgnoreCase(sdto.getTitle().trim())
                                && s.isCompleted() != sdto.isCompleted())
                        .findFirst()
                        .ifPresent(s -> {
                            addActivity(task, "Checklist item: '" + s.getTitle() + "' marcado como "
                                    + (sdto.isCompleted() ? "CONCLUÍDO" : "PENDENTE"));
                        });
            });

            // Re-sync subtasks
            task.getSubtasks().clear();
            List<Subtask> subtasks = dto.getSubtasks().stream()
                    .map(s -> Subtask.builder()
                            .title(s.getTitle())
                            .completed(s.isCompleted())
                            .task(task)
                            .build())
                    .collect(Collectors.toList());
            task.getSubtasks().addAll(subtasks);
        }

        return toDTO(taskRepository.save(task));
    }

    @Transactional
    public void delete(UUID id) {
        log.info("Deleting task id: {}", id);
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    @Transactional
    public TaskDTO restore(UUID id) {
        log.info("Restoring task id: {}", id);
        int updated = taskRepository.restoreByIdNative(id);
        if (updated == 0) {
            throw new TaskNotFoundException("Could not restore task with id: " + id);
        }
        Task task = taskRepository.findByIdIncludeDeleted(id)
                .orElseThrow(() -> new TaskNotFoundException("Task restored but not found: " + id));

        addActivity(task, "Tarefa restaurada.");

        return toDTO(taskRepository.save(task));
    }

    private void addActivity(Task task, String message) {
        // Deduplication: Don't add if a very recent activity (last 30s) or a
        // null-timestamp activity in this session has the same message
        boolean isDuplicate = task.getActivities().stream()
                .anyMatch(a -> a.getMessage().equals(message) &&
                        (a.getTimestamp() == null || a.getTimestamp().isAfter(LocalDateTime.now().minusSeconds(30))));

        if (isDuplicate) {
            log.debug("Skipping duplicate activity log for task {}: {}", task.getId(), message);
            return;
        }

        log.info("Adding activity to task {}: {}", task.getId(), message);
        task.getActivities().add(Activity.builder()
                .message(message)
                .task(task)
                .build());
    }

    private TaskDTO toDTO(Task task) {
        return TaskDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .completedAt(task.getCompletedAt())
                .overdue(task.isOverdue())
                .progress(task.getProgress())
                .important(task.isImportant())
                .reminderEnabled(task.isReminderEnabled())
                .reminderTime(task.getReminderTime())
                .subtasks(task.getSubtasks().stream()

                        .map(s -> SubtaskDTO.builder()
                                .id(s.getId())
                                .title(s.getTitle())
                                .completed(s.isCompleted())
                                .build())
                        .collect(Collectors.toList()))
                .activities(task.getActivities().stream()
                        .map(a -> ActivityDTO.builder()
                                .id(a.getId())
                                .message(a.getMessage())
                                .timestamp(a.getTimestamp())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
