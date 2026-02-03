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
                    .title("Configurar Spring Boot")
                    .description("Configuração inicial do projeto com dependências necessárias.")
                    .status(TaskStatus.DONE)
                    .priority(Priority.HIGH)
                    .dueDate(LocalDateTime.now().plusDays(1))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Desenhar Telas no Figma")
                    .description("Criar protótipos de alta fidelidade para o Kanban.")
                    .status(TaskStatus.DONE)
                    .priority(Priority.MEDIUM)
                    .dueDate(LocalDateTime.now().plusDays(2))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Implementar Drag & Drop")
                    .description("Utilizar dnd-kit para permitir movimentação entre colunas.")
                    .status(TaskStatus.DOING)
                    .priority(Priority.HIGH)
                    .dueDate(LocalDateTime.now().plusDays(3))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Escrever Testes Unitários")
                    .description("Garantir cobertura da camada de service com JUnit e Mockito.")
                    .status(TaskStatus.TODO)
                    .priority(Priority.HIGH)
                    .dueDate(LocalDateTime.now().plusDays(5))
                    .deleted(false)
                    .build(),
                Task.builder()
                    .title("Documentar com Swagger")
                    .description("Configurar o SpringDoc para gerar a documentação automática.")
                    .status(TaskStatus.TODO)
                    .priority(Priority.LOW)
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
