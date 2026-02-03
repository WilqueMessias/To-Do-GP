package com.tm.api.dto;

import com.tm.api.model.Priority;
import com.tm.api.model.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Data Transfer Object for Task operations")
public class TaskDTO {
    @Schema(description = "Unique identifier (UUID)", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;

    @Schema(description = "Task title", example = "Integrate API", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Title is required")
    private String title;

    @Schema(description = "Detailed description", example = "Connect the frontend with the Spring Boot backend")
    private String description;

    @Schema(description = "Current status", example = "TODO", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Status is required")
    private TaskStatus status;

    @Schema(description = "Task priority", example = "HIGH", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Priority is required")
    private Priority priority;

    @Schema(description = "Deadline for the task", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    @Schema(description = "Auto-generated creation timestamp", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime updatedAt;

    @Schema(description = "Completion timestamp (if status is DONE)", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime completedAt;

    @Schema(description = "Whether the task is overdue", accessMode = Schema.AccessMode.READ_ONLY)
    private boolean overdue;

    @Schema(description = "Calculated progress (0-100)", accessMode = Schema.AccessMode.READ_ONLY)
    private double progress;

    @Schema(description = "List of subtasks (Checklist)")
    @Builder.Default
    private java.util.List<SubtaskDTO> subtasks = new java.util.ArrayList<>();

    @Schema(description = "Activity history (Audit Log)", accessMode = Schema.AccessMode.READ_ONLY)
    @Builder.Default
    private java.util.List<ActivityDTO> activities = new java.util.ArrayList<>();
}
