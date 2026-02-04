package com.tm.api.config;

import com.tm.api.model.Priority;
import com.tm.api.model.Task;
import com.tm.api.model.TaskStatus;
import com.tm.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;

    @Override
    public void run(String... args) {
        if (taskRepository.count() == 0) {
            log.info("Database is empty. Seeding initial data...");
            
            List<Task> initialTasks = List.of(
                Task.builder()
                    .title("Revisar conceitos de POO")
                    .description("Ler anotações e criar exemplos de classes, herança e polimorfismo.")
                    .status(TaskStatus.DONE)
                    .priority(Priority.MEDIUM)
                    .dueDate(LocalDateTime.now().plusDays(1))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Resolver exercícios de arrays")
                    .description("Completar 10 exercícios de lógica com arrays e loops.")
                    .status(TaskStatus.DONE)
                    .priority(Priority.LOW)
                    .dueDate(LocalDateTime.now().plusDays(2))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Mini-projeto: to-do em JavaScript")
                    .description("Criar CRUD simples com localStorage e validação básica.")
                    .status(TaskStatus.DOING)
                    .priority(Priority.HIGH)
                    .dueDate(LocalDateTime.now().plusDays(3))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Estudar Git e GitHub")
                    .description("Praticar commits, branches, merges e pull requests.")
                    .status(TaskStatus.TODO)
                    .priority(Priority.MEDIUM)
                    .dueDate(LocalDateTime.now().plusDays(5))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Revisar testes unitários")
                    .description("Implementar testes básicos para funções utilitárias.")
                    .status(TaskStatus.TODO)
                    .priority(Priority.HIGH)
                    .dueDate(LocalDateTime.now().plusDays(7))
                    .deleted(false)
                    .build()
            );
            
            taskRepository.saveAll(initialTasks);
            log.info("Database seeded successfully with 5 tasks.");
        } else {
            log.info("Database already contains data. Skipping seeding.");
        }
    }
}
