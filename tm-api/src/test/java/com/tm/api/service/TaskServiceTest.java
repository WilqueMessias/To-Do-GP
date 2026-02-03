package com.tm.api.service;

import com.tm.api.dto.TaskDTO;
import com.tm.api.model.Priority;
import com.tm.api.model.Task;
import com.tm.api.model.TaskStatus;
import com.tm.api.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.tm.api.exception.TaskNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task task;
    private TaskDTO taskDTO;

    @BeforeEach
    void setUp() {
        task = Task.builder()
                .id(UUID.randomUUID())
                .title("Test Task")
                .description("Description")
                .status(TaskStatus.TODO)
                .priority(Priority.MEDIUM)
                .dueDate(LocalDateTime.now().plusDays(1))
                .build();

        taskDTO = TaskDTO.builder()
                .title("Test Task")
                .description("Description")
                .status(TaskStatus.TODO)
                .priority(Priority.MEDIUM)
                .dueDate(LocalDateTime.now().plusDays(1))
                .build();
    }

    @Test
    void findAll_ShouldReturnPage() {
        Page<Task> taskPage = new PageImpl<>(List.of(task));
        when(taskRepository.findAll(any(Pageable.class))).thenReturn(taskPage);
        
        Page<TaskDTO> result = taskService.findAll(null, Pageable.unpaged());
        
        assertFalse(result.isEmpty());
        assertEquals(1, result.getTotalElements());
        assertEquals(task.getTitle(), result.getContent().get(0).getTitle());
    }

    @Test
    void findAll_ShouldReturnList() {
        Page<Task> taskPage = new PageImpl<>(List.of(task));
        when(taskRepository.findAll(any(Pageable.class))).thenReturn(taskPage);
        Page<TaskDTO> result = taskService.findAll(null, Pageable.unpaged());
        assertFalse(result.isEmpty());
        // assertEquals(1, result.getTotalElements()); 
    }

    @Test
    void create_ShouldReturnSavedTask() {
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        TaskDTO result = taskService.create(taskDTO);
        assertNotNull(result);
        assertEquals(task.getTitle(), result.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void findById_WhenExists_ShouldReturnTask() {
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));
        TaskDTO result = taskService.findById(task.getId());
        assertNotNull(result);
        assertEquals(task.getId(), result.getId());
    }

    @Test
    void findById_WhenNotExists_ShouldThrowException() {
        UUID id = UUID.randomUUID();
        when(taskRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(TaskNotFoundException.class, () -> taskService.findById(id));
    }

    @Test
    void delete_WhenExists_ShouldCallRepository() {
        when(taskRepository.existsById(task.getId())).thenReturn(true);
        taskService.delete(task.getId());
        verify(taskRepository, times(1)).deleteById(task.getId());
    }
}
