package com.tm.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Data Transfer Object for Subtask operations")
public class SubtaskDTO {
    @Schema(description = "Unique identifier (UUID)", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;

    @Schema(description = "Subtask title", example = "Define data model", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Title is required")
    private String title;

    @Schema(description = "Subtask completion status", example = "false")
    private boolean completed;

    @Schema(description = "Creation timestamp", accessMode = Schema.AccessMode.READ_ONLY)
    private java.time.LocalDateTime createdAt;

    @Schema(description = "Completion timestamp", accessMode = Schema.AccessMode.READ_ONLY)
    private java.time.LocalDateTime completedAt;
}
