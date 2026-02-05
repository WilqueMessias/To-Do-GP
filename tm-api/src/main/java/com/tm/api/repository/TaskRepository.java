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
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t WHERE t.status = :status ORDER BY t.position ASC, t.createdAt DESC")
    Page<Task> findByStatus(@org.springframework.data.repository.query.Param("status") TaskStatus status,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Task t ORDER BY t.position ASC, t.createdAt DESC")
    Page<Task> findAll(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t WHERE t.status = :status")
    int findMaxPositionByStatus(@org.springframework.data.repository.query.Param("status") TaskStatus status);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM tasks WHERE id = :id", nativeQuery = true)
    java.util.Optional<Task> findByIdIncludeDeleted(@org.springframework.data.repository.query.Param("id") UUID id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE tasks SET deleted = false WHERE id = :id", nativeQuery = true)
    int restoreByIdNative(@org.springframework.data.repository.query.Param("id") UUID id);

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

    // Bulk Operations
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "UPDATE tasks SET deleted = false, status = 'DONE' WHERE deleted = true", nativeQuery = true)
    void restoreAllDeletedNative();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM activities WHERE task_id IN (SELECT id FROM tasks WHERE deleted = true)", nativeQuery = true)
    void deleteAllDeletedActivitiesNative();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM subtasks WHERE task_id IN (SELECT id FROM tasks WHERE deleted = true)", nativeQuery = true)
    void deleteAllDeletedSubtasksNative();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM tasks WHERE deleted = true", nativeQuery = true)
    void deleteAllDeletedNative();
}
