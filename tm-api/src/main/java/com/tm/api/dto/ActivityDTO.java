package com.tm.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Data Transfer Object for Audit Activity logs")
public class ActivityDTO {
    @Schema(description = "Unique identifier (UUID)", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;

    @Schema(description = "Human-readable change description", example = "Status alterado de TODO para DONE")
    private String message;

    @Schema(description = "Precise timestamp of the activity", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime timestamp;
}
