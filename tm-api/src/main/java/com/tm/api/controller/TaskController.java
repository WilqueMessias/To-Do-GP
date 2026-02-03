package com.tm.api.controller;

import com.tm.api.dto.TaskDTO;
import com.tm.api.model.TaskStatus;
import com.tm.api.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Endpoints for managing project tasks")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "List all tasks", description = "Returns a list of all tasks, optionally filtered by status")
    @GetMapping
    public List<TaskDTO> getAllTasks(
            @Parameter(description = "Filter by status (TODO, DOING, DONE)") 
            @RequestParam(required = false) TaskStatus status) {
        log.info("Request to get all tasks with status: {}", status);
        return taskService.findAll(status);
    }

    @Operation(summary = "Get task by ID")
    @ApiResponse(responseCode = "200", description = "Task found")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getById(@PathVariable UUID id) {
        log.info("Request to get task id: {}", id);
        return ResponseEntity.ok(taskService.findById(id));
    }

    @Operation(summary = "Create a new task")
    @ApiResponse(responseCode = "201", description = "Task created successfully")
    @PostMapping
    public ResponseEntity<TaskDTO> create(@Valid @RequestBody TaskDTO dto) {
        log.info("Request to create task: {}", dto.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(dto));
    }

    @Operation(summary = "Update an existing task")
    @ApiResponse(responseCode = "200", description = "Task updated successfully")
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> update(@PathVariable UUID id, @Valid @RequestBody TaskDTO dto) {
        log.info("Request to update task id: {}", id);
        return ResponseEntity.ok(taskService.update(id, dto));
    }

    @Operation(summary = "Delete a task")
    @ApiResponse(responseCode = "204", description = "Task deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        log.info("Request to delete task id: {}", id);
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
