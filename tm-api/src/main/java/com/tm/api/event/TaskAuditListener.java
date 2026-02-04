package com.tm.api.event;

import com.tm.api.model.Activity;
import com.tm.api.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TaskAuditListener {

    private final ActivityRepository activityRepository;

    @Async
    @EventListener
    @Transactional
    public void handleTaskAuditEvent(TaskAuditEvent event) {
        log.info("Asynchronously processing audit event for task: {}", event.getTask().getId());

        // If it's a creation event (no old values), we can just log a single "Task
        // Created"
        if (event.getOldValues().isEmpty()) {
            Activity activity = Activity.builder()
                    .task(event.getTask())
                    .message("Tarefa criada com sucesso")
                    .build();
            activityRepository.save(activity);
            return;
        }

        event.getNewValues().forEach((field, newValue) -> {
            Object oldValue = event.getOldValues().get(field);
            String message = buildHumanReadableMessage(field, oldValue, newValue);

            if (message != null) {
                Activity activity = Activity.builder()
                        .task(event.getTask())
                        .message(message)
                        .build();
                activityRepository.save(activity);
            }
        });
    }

    private String buildHumanReadableMessage(String field, Object oldValue, Object newValue) {
        try {
            String oldValStr = oldValue == null ? "vazio" : oldValue.toString();
            String newValStr = newValue == null ? "vazio" : newValue.toString();

            if (field.startsWith("subtask_added_")) {
                return String.format("Subtarefa adicionada: '%s'", newValue);
            }
            if (field.startsWith("subtask_removed_")) {
                return String.format("Subtarefa removida: '%s'", oldValue);
            }
            if (field.startsWith("subtask_completed_")) {
                return String.format("Subtarefa concluída: '%s'", newValue);
            }
            if (field.startsWith("subtask_uncompleted_")) {
                return String.format("Subtarefa marcada como pendente: '%s'", newValue);
            }
            if (field.startsWith("subtask_renamed_")) {
                return String.format("Subtarefa renomeada: '%s' → '%s'", oldValue, newValue);
            }

            return switch (field) {
                case "status" -> String.format("Status atualizado: %s → %s", oldValStr, newValStr);
                case "título" -> String.format("Título alterado de '%s' para '%s'", oldValStr, newValStr);
                case "prioridade" -> String.format("Prioridade alterada de %s para %s", oldValStr, newValStr);
                case "deleted" ->
                    (Boolean) newValue ? "Tarefa movida para a lixeira" : "Tarefa restaurada do histórico";
                case "prazo" -> newValue == null ? "Prazo removido"
                        : String.format("Prazo alterado para %s", formatValue(newValue));
                case "importância" ->
                    (Boolean) newValue ? "Tarefa marcada como importante" : "Marcação de importância removida";
                case "lembrete" -> (Boolean) newValue ? "Lembrete ativado" : "Lembrete desativado";
                default -> String.format("Campo '%s' atualizado", field);
            };
        } catch (Exception e) {
            return String.format("Alteração detectada no campo '%s'", field);
        }
    }

    private String formatValue(Object value) {
        if (value instanceof java.time.LocalDateTime ldt) {
            return ldt.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
        return value.toString();
    }
}
