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
    @org.springframework.data.jpa.repository.Query(value = "UPDATE tasks SET deleted = false WHERE id = :id", nativeQuery = true)
    int restoreByIdNative(@org.springframework.data.repository.query.Param("id") java.util.UUID id);
}
