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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Endpoints for managing project tasks")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "List all tasks (Paginated)", description = "Terminal endpoint to retrieve task entities. Supports server-side status filtering and JPA-based pagination. "
            +
            "Calculated fields like 'overdue' and 'progress' are hydrated during entity induction.")
    @GetMapping
    public Page<TaskDTO> getAllTasks(
            @Parameter(description = "Filter by status (TODO, DOING, DONE)") @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Pagination parameters (page, size, sort)") Pageable pageable) {
        log.info("Request to get paginated tasks with status: {}", status);
        return taskService.findAll(status, pageable);
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

    @Operation(summary = "Update an existing task", description = "Triggers the **Differential Audit Engine**. Compares incoming DTO values with persistent state. "
            +
            "Generates human-readable immutable Activity logs for every detected state transition.")
    @ApiResponse(responseCode = "200", description = "Task updated successfully and audit logs generated")
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> update(@PathVariable UUID id, @Valid @RequestBody TaskDTO dto) {
        log.info("Request to update task id: {}", id);
        return ResponseEntity.ok(taskService.update(id, dto));
    }

    @Operation(summary = "Delete a task (Logical Deletion)", description = "Applies a logical 'deleted' flag using Hibernate @SQLDelete. "
            +
            "The entity remains in the database for recovery or audit review.")
    @ApiResponse(responseCode = "204", description = "Task logically archived")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        log.info("Request to delete task: {}", id);
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Restore a task", description = "Brings back a previously soft-deleted task")
    @ApiResponse(responseCode = "200", description = "Task restored")
    @PostMapping("/{id}/restore")
    public TaskDTO restoreTask(@PathVariable UUID id) {
        log.info("Request to restore task: {}", id);
        return taskService.restore(id);
    }

    @Operation(summary = "Get deleted tasks history", description = "Returns all soft-deleted tasks")
    @GetMapping("/history")
    public java.util.List<TaskDTO> getHistory() {
        log.info("Request to get task history");
        return taskService.getHistory();
    }

    @Operation(summary = "Clear all history", description = "Permanently removes all soft-deleted tasks.")
    @ApiResponse(responseCode = "204", description = "History cleared")
    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory() {
        log.info("Request to clear all task history");
        taskService.clearHistory();
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Restore all history", description = "Restores all soft-deleted tasks to DONE.")
    @ApiResponse(responseCode = "204", description = "All history restored")
    @PostMapping("/history/restore")
    public ResponseEntity<Void> restoreAllHistory() {
        log.info("Request to restore all task history");
        taskService.restoreAllHistory();
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Permanently delete a task", description = "Removes the task from the database entirely. Cannot be undone.")
    @ApiResponse(responseCode = "204", description = "Task permanently deleted")
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDelete(@PathVariable UUID id) {
        log.info("Request to hard delete task: {}", id);
        taskService.hardDelete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder tasks bulkadamente", description = "Updates positions of multiple tasks at once. Useful for drag-and-drop persistence.")
    @ApiResponse(responseCode = "204", description = "Tasks reordered successfully")
    @PostMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody java.util.List<java.util.Map<String, Object>> taskPositions) {
        log.info("Request to bulk reorder tasks");
        taskService.updatePositions(taskPositions);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-status")
    public ResponseEntity<Void> bulkStatus(@RequestBody java.util.Map<String, Object> payload) {
        java.util.List<String> ids = (java.util.List<String>) payload.get("ids");
        String status = (String) payload.get("status");
        taskService.bulkUpdateStatus(ids.stream().map(UUID::fromString).collect(java.util.stream.Collectors.toList()),
                com.tm.api.model.TaskStatus.valueOf(status));
        return ResponseEntity.noContent().build();
    }
}
