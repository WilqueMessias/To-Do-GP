package com.tm.api.mapper;

import com.tm.api.dto.ActivityDTO;
import com.tm.api.dto.SubtaskDTO;
import com.tm.api.dto.TaskDTO;
import com.tm.api.model.Task;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TaskMapper {

        public TaskDTO toDTO(Task task) {
                if (task == null)
                        return null;

                return TaskDTO.builder()
                                .id(task.getId())
                                .title(task.getTitle())
                                .position(task.getPosition())
                                .description(task.getDescription())
                                .status(task.getStatus())
                                .priority(task.getPriority())
                                .dueDate(task.getDueDate())
                                .createdAt(task.getCreatedAt())
                                .updatedAt(task.getUpdatedAt())
                                .completedAt(task.getCompletedAt())
                                .deletedAt(task.getDeletedAt())
                                .overdue(task.isOverdue())
                                .progress(task.getProgress())
                                .important(task.isImportant())
                                .reminderEnabled(task.isReminderEnabled())
                                .reminderTime(task.getReminderTime())
                                .subtasks(task.getSubtasks().stream()
                                                .map(s -> {
                                                        var sDto = SubtaskDTO.builder()
                                                                        .id(s.getId())
                                                                        .title(s.getTitle())
                                                                        .completed(s.isCompleted())
                                                                        .createdAt(s.getCreatedAt())
                                                                        .completedAt(s.getCompletedAt())
                                                                        .build();
                                                        return sDto;
                                                })
                                                .collect(Collectors.toList()))
                                .activities(task.getActivities().stream()
                                                .map(a -> ActivityDTO.builder()
                                                                .id(a.getId())
                                                                .message(a.getMessage())
                                                                .fieldName(a.getFieldName())
                                                                .oldVal(a.getOldVal())
                                                                .newVal(a.getNewVal())
                                                                .timestamp(a.getTimestamp())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .build();
        }
}
