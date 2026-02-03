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

        task.getActivities().add(Activity.builder()
                .message("Tarefa criada com o status " + task.getStatus())
                .task(task)
                .build());
        
        return toDTO(taskRepository.save(task));
    }

    @Transactional
    public TaskDTO update(UUID id, TaskDTO dto) {
        log.info("Updating task id: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
        
        TaskStatus oldStatus = task.getStatus();
        if (!task.getTitle().equals(dto.getTitle())) {
            task.getActivities().add(Activity.builder()
                    .message("Título alterado: " + task.getTitle() + " -> " + dto.getTitle())
                    .task(task)
                    .build());
            task.setTitle(dto.getTitle());
        }

        if (task.getDescription() != null && !task.getDescription().equals(dto.getDescription())) {
            task.getActivities().add(Activity.builder()
                    .message("Descrição técnica atualizada.")
                    .task(task)
                    .build());
            task.setDescription(dto.getDescription());
        } else if (task.getDescription() == null && dto.getDescription() != null) {
             task.setDescription(dto.getDescription());
        }

        if (task.getPriority() != dto.getPriority()) {
            task.getActivities().add(Activity.builder()
                    .message("Prioridade alterada: " + task.getPriority() + " -> " + dto.getPriority())
                    .task(task)
                    .build());
            task.setPriority(dto.getPriority());
        }

        if (task.getDueDate() != null && !task.getDueDate().equals(dto.getDueDate())) {
            task.getActivities().add(Activity.builder()
                    .message("Prazo renegociado.")
                    .task(task)
                    .build());
            task.setDueDate(dto.getDueDate());
        } else if (task.getDueDate() == null && dto.getDueDate() != null) {
            task.setDueDate(dto.getDueDate());
        }

        task.setStatus(dto.getStatus());

        if (task.getStatus() == TaskStatus.DONE && oldStatus != TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        } else if (task.getStatus() != TaskStatus.DONE) {
            task.setCompletedAt(null);
        }

        if (oldStatus != task.getStatus()) {
            task.getActivities().add(Activity.builder()
                    .message("Status alterado de " + oldStatus + " para " + task.getStatus())
                    .task(task)
                    .build());
        }
        
        if (dto.getSubtasks() != null) {
            // Log subtask completion changes
            dto.getSubtasks().forEach(sdto -> {
                task.getSubtasks().stream()
                    .filter(s -> s.getTitle().equals(sdto.getTitle()) && s.isCompleted() != sdto.isCompleted())
                    .findFirst()
                    .ifPresent(s -> {
                        task.getActivities().add(Activity.builder()
                                .message("Checklist item: '" + s.getTitle() + "' marcado como " + (sdto.isCompleted() ? "CONCLUÍDO" : "PENDENTE"))
                                .task(task)
                                .build());
                    });
            });

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
        // Use native find to bypass @Where clause in case of cache issues
        return taskRepository.findByIdIncludeDeleted(id)
                .map(this::toDTO)
                .orElseThrow(() -> new TaskNotFoundException("Task restored but not found: " + id));
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
