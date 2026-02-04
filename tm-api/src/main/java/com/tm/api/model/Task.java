package com.tm.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE tasks SET deleted = true WHERE id=?")
@SQLRestriction("deleted = false")

public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    @Column
    @Builder.Default
    private Boolean important = false;

    @Column
    @Builder.Default
    private Boolean reminderEnabled = false;

    @Column
    private LocalDateTime reminderTime;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime completedAt;

    @Builder.Default
    private Boolean deleted = false;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Subtask> subtasks = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("timestamp DESC")
    private java.util.List<Activity> activities = new java.util.ArrayList<>();

    public boolean isOverdue() {
        return status != TaskStatus.DONE && dueDate != null && dueDate.isBefore(LocalDateTime.now());
    }

    /**
     * Business Logic: Unified Status Transition
     */
    public void transitionTo(TaskStatus newStatus) {
        if (this.status == TaskStatus.DONE && newStatus != TaskStatus.DONE) {
            this.completedAt = null;
        } else if (newStatus == TaskStatus.DONE && this.status != TaskStatus.DONE) {
            this.completedAt = LocalDateTime.now();
        }
        this.status = newStatus;
    }

    /**
     * Business Logic: Progress Calculation
     */
    public double getProgress() {
        if (subtasks == null || subtasks.isEmpty()) {
            return status == TaskStatus.DONE ? 100.0 : 0.0;
        }
        long completedCount = subtasks.stream().filter(Subtask::isCompleted).count();
        return (double) completedCount / subtasks.size() * 100.0;
    }

    public boolean isImportant() {
        return Boolean.TRUE.equals(important);
    }

    public boolean isReminderEnabled() {
        return Boolean.TRUE.equals(reminderEnabled);
    }

    public boolean isDeleted() {
        return Boolean.TRUE.equals(deleted);
    }
}
