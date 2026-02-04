package com.tm.api.repository;

import com.tm.api.model.Task;
import com.tm.api.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM tasks WHERE id = :id", nativeQuery = true)
    java.util.Optional<Task> findByIdIncludeDeleted(UUID id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE tasks SET deleted = false WHERE id = ?1", nativeQuery = true)
    int restoreByIdNative(java.util.UUID id);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM tasks WHERE deleted = true ORDER BY completed_at DESC", nativeQuery = true)
    java.util.List<Task> findAllDeletedNative();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM tasks WHERE id = ?1", nativeQuery = true)
    void deletePermanentlyNative(java.util.UUID id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM notifications WHERE task_id = ?1", nativeQuery = true)
    void deleteNotificationsNative(java.util.UUID id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM activities WHERE task_id = ?1", nativeQuery = true)
    void deleteActivitiesNative(java.util.UUID id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM subtasks WHERE task_id = ?1", nativeQuery = true)
    void deleteSubtasksNative(java.util.UUID id);
}
