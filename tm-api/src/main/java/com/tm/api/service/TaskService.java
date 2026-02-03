package com.tm.api.service;

import com.tm.api.dto.TaskDTO;
import com.tm.api.exception.TaskNotFoundException;
import com.tm.api.model.Task;
import com.tm.api.model.TaskStatus;
import com.tm.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<TaskDTO> findAll(TaskStatus status) {
        log.info("Fetching all tasks with status: {}", status != null ? status : "ALL");
        List<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByStatus(status);
        } else {
            tasks = taskRepository.findAll();
        }
        return tasks.stream().map(this::toDTO).collect(Collectors.toList());
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
        return toDTO(taskRepository.save(task));
    }

    @Transactional
    public TaskDTO update(UUID id, TaskDTO dto) {
        log.info("Updating task id: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));
        
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate());
        
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

    private TaskDTO toDTO(Task task) {
        return TaskDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
