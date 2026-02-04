import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    MeasuringStrategy,
    TouchSensor,
    MouseSensor,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import type { Task } from '../services/api';
import { taskService } from '../services/api';
import { TaskCardContent } from './TaskCard';
import { Trash2, History } from 'lucide-react';
import { HistoryModal } from './HistoryModal';
import { ConfirmationModal } from './ConfirmationModal';

interface KanbanBoardProps {
    onEditTask: (task: Task) => void;
    onUpdateTask?: (id: string, updates: Partial<Task>) => void;
    onTasksChange?: (tasks: Task[]) => void;
    onRemoveTasks?: (ids: string[]) => void;
    onRefresh?: () => void;
    tasks?: Task[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    onEditTask,
    onUpdateTask,
    onTasksChange,
    onRemoveTasks,
    onRefresh,
    tasks = []
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [internalTasks, setInternalTasks] = useState<Task[]>(tasks);
    const isDraggingRef = React.useRef(false);
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
    const [taskToConfirmDelete, setTaskToConfirmDelete] = useState<Task | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // History & Modal State
    const [history, setHistory] = useState<Task[]>([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const buildTaskPayload = (task: Task, updates: Partial<Task> = {}) => ({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        important: task.important,
        reminderEnabled: task.reminderEnabled,
        reminderTime: task.reminderTime,
        subtasks: task.subtasks ?? [],
        ...updates
    });

    // Initial load
    React.useEffect(() => {
        // Prevent flashing by only fetching if modal is open or on initial mount if needed
        // For now, let's fetch when modal opens or here
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await taskService.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    React.useEffect(() => {
        const handleDeleteKey = async (event: KeyboardEvent) => {
            if (event.key !== 'Delete') return;

            const target = event.target as HTMLElement | null;
            const isTypingField = target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            );
            if (isTypingField) return;
            if (!hoveredTaskId) return;
            if (taskToConfirmDelete) return;

            const taskToDelete = internalTasks.find(t => t.id === hoveredTaskId);
            if (!taskToDelete) return;

            setTaskToConfirmDelete(taskToDelete);
        };

        window.addEventListener('keydown', handleDeleteKey);
        return () => window.removeEventListener('keydown', handleDeleteKey);
    }, [hoveredTaskId, internalTasks, taskToConfirmDelete]);

    // Cleanup: task deletion confirming logic is now handled by ConfirmationModal implicitly
    // but we still need to handle the Enter/Esc for taskToConfirmDelete if we keep it separate,
    // OR just use the common state. Let's merge it for simplicity.


    // Refresh history when modal opens
    React.useEffect(() => {
        if (isHistoryModalOpen) {
            fetchHistory();
        }
    }, [isHistoryModalOpen]);

    const handleClearCompleted = async () => {
        const completedTasks = internalTasks.filter(t => t.status === 'DONE');
        if (completedTasks.length === 0) return;

        // Optimistic update (Local)
        const remainingTasks = internalTasks.filter(t => t.status !== 'DONE');
        setInternalTasks(remainingTasks);

        // Optimistic update (Parent) - Prevents flicker
        if (onRemoveTasks) {
            onRemoveTasks(completedTasks.map(t => t.id));
        } else if (onTasksChange) {
            // Fallback (might fail due to merge logic, but better than nothing)
            onTasksChange(remainingTasks);
        }

        // API Delete 
        for (const task of completedTasks) {
            try {
                await taskService.delete(task.id);
            } catch (error) {
                console.error(`Failed to delete task ${task.id}`, error);
            }
        }

        // Final Sync
        if (onRefresh) onRefresh();

        // Refresh history after deletion
        fetchHistory();
    };

    const handleRestoreFromHistory = async (taskToRestore: Task) => {
        try {
            // 1. Restore the task (Undelete)
            const response = await taskService.restore(taskToRestore.id);
            let restored = response.data;

            // 2. Force move to DONE as requested
            const updateResponse = await taskService.update(restored.id, buildTaskPayload(restored, { status: 'DONE' }));
            restored = updateResponse.data;

            // Update local state (Optimistic)
            setHistory(prev => prev.filter(t => t.id !== taskToRestore.id));

            // Add back to board
            const newTasks = [...internalTasks, restored];
            setInternalTasks(newTasks);

            // Sync with parent for full reload
            if (onRefresh) onRefresh();

            // Refresh history from server
            await fetchHistory();

        } catch (error) {
            console.error("Failed to restore task", error);
            alert("Erro ao restaurar tarefa. Verifique o console.");
        }
    };

    const handleHardDelete = (taskToDelete: Task) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Excluir permanentemente',
            message: `Tem certeza que deseja excluir permanentemente "${taskToDelete.title}"?\n\nEsta ação não pode ser desfeita.`,
            onConfirm: async () => {
                try {
                    await taskService.hardDelete(taskToDelete.id);
                    setHistory(prev => prev.filter(t => t.id !== taskToDelete.id));
                    if (onRefresh) onRefresh();
                    await fetchHistory();
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error("Failed to delete task permanently", error);
                }
            }
        });
    };

    const handleRestoreAllHistory = () => {
        setConfirmationModal({
            isOpen: true,
            title: 'Restaurar tudo',
            message: "Tem certeza que deseja restaurar TODAS as tarefas do histórico para 'Concluído'?",
            variant: 'info',
            onConfirm: async () => {
                try {
                    await taskService.restoreAllHistory();
                    setHistory([]);
                    if (onRefresh) onRefresh();
                    await fetchHistory();
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error("Failed to restore all history", error);
                }
            }
        });
    };

    const handleClearHistory = () => {
        setConfirmationModal({
            isOpen: true,
            title: 'Limpar Histórico',
            message: "ATENÇÃO: Isso excluirá PERMANENTEMENTE todo o histórico de tarefas.\n\nEsta ação não pode ser desfeita. Deseja continuar?",
            onConfirm: async () => {
                try {
                    await taskService.clearHistory();
                    setHistory([]);
                    await fetchHistory();
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error("Failed to clear history", error);
                }
            }
        });
    };

    const confirmDeleteTask = async () => {
        if (!taskToConfirmDelete) return;

        try {
            await taskService.delete(taskToConfirmDelete.id);

            setInternalTasks(prev => prev.filter(t => t.id !== taskToConfirmDelete.id));
            if (onRemoveTasks) {
                onRemoveTasks([taskToConfirmDelete.id]);
            } else if (onTasksChange) {
                onTasksChange(internalTasks.filter(t => t.id !== taskToConfirmDelete.id));
            }

            if (onRefresh) onRefresh();
            await fetchHistory();
            setHoveredTaskId(null);
        } catch (error) {
            console.error("Failed to delete task", error);
        } finally {
            setTaskToConfirmDelete(null);
        }
    };

    // Sync only when NOT dragging to avoid jitter, but listen to external updates
    React.useEffect(() => {
        if (!isDraggingRef.current) {
            setInternalTasks(tasks);
        }
    }, [tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        isDraggingRef.current = true;
        const task = internalTasks.find((t) => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Use functional state update with local 'currentTasks' snapshot to avoid dependency bloat
        setInternalTasks((currentTasks) => {
            const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
            const overIndex = currentTasks.findIndex((t) => t.id === overId);

            if (activeIndex === -1) return currentTasks;

            const activeTask = currentTasks[activeIndex];
            const isOverAColumn = ['TODO', 'DOING', 'DONE'].includes(overId as string);

            if (isOverAColumn) {
                const newStatus = overId as Task['status'];
                if (activeTask.status !== newStatus) {
                    const newTasks = [...currentTasks];
                    newTasks[activeIndex] = { ...activeTask, status: newStatus };
                    return newTasks;
                }
                return currentTasks;
            }

            if (overIndex === -1) return currentTasks;
            const overTask = currentTasks[overIndex];

            const newTasks = [...currentTasks];

            // If checking against a task in a different column, update status immediately
            if (activeTask.status !== overTask.status) {
                newTasks[activeIndex] = { ...activeTask, status: overTask.status };
                return arrayMove(newTasks, activeIndex, overIndex);
            }

            return arrayMove(newTasks, activeIndex, overIndex);
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        isDraggingRef.current = false;
        setActiveTask(null);

        // Commit the final state to the parent
        // We use the latest 'internalTasks' state here
        // However, we need to correctly persist the CHANGE.
        // DragEnd checks 'over' but we may have already moved the item in 'internalTasks' via DragOver.
        // So we just push 'internalTasks' to the parent to ensure sync.

        if (onTasksChange) {
            onTasksChange(internalTasks);
        }

        if (!over) return;

        const task = internalTasks.find((t) => t.id === active.id);
        if (!task) return;

        try {
            await taskService.update(task.id, buildTaskPayload(task, { status: task.status }));
        } catch (error) {
            console.error('Failed to persist task movement:', error);
            // Revert on error if needed, or rely on parent reload
        }
    };

    const columns: { id: Task['status']; title: string }[] = [
        { id: 'TODO', title: 'A Fazer' },
        { id: 'DOING', title: 'Em Progresso' },
        { id: 'DONE', title: 'Concluído' },
    ];

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-8 justify-center items-center md:items-start overflow-x-auto min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-80px)]">
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}

                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always,
                    },
                }}
                accessibility={{
                    // Disable announcements to prevent screen reader lag during rapid drag
                    announcements: {
                        onDragStart: () => '',
                        onDragOver: () => '',
                        onDragEnd: () => '',
                        onDragCancel: () => '',
                    },
                    screenReaderInstructions: {
                        draggable: '',
                    }
                }}
            >
                {columns.map((col) => (
                    <div key={col.id} className="w-full md:w-auto flex-shrink-0">
                        <KanbanColumn
                            id={col.id}
                            title={col.title}
                            tasks={internalTasks.filter((t) => t.status === col.id)}
                            onTaskClick={onEditTask}
                            onUpdateTask={onUpdateTask}
                            onHoverChange={setHoveredTaskId}
                            headerAction={col.id === 'DONE' ? (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setIsHistoryModalOpen(true)}
                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Histórico de Limpeza"
                                    >
                                        <History size={16} />
                                    </button>
                                    <button
                                        onClick={handleClearCompleted}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Limpar Concluídos"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : undefined}
                        />
                    </div>
                ))}

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask ? (
                        <div className="rotate-2 scale-105 cursor-grabbing shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                            <TaskCardContent
                                task={activeTask}
                                onClick={() => { }}
                                style={{ transform: 'none' }} // Ensure no double transform
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <HistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                history={history}
                onRestore={handleRestoreFromHistory}
                onHardDelete={handleHardDelete}
                onClearHistory={handleClearHistory}
                onRestoreAll={handleRestoreAllHistory}
            />

            {taskToConfirmDelete && (
                <ConfirmationModal
                    isOpen={!!taskToConfirmDelete}
                    title="Confirmar exclusão"
                    message={`Excluir a tarefa "${taskToConfirmDelete.title}"?`}
                    onConfirm={confirmDeleteTask}
                    onClose={() => setTaskToConfirmDelete(null)}
                    confirmLabel="Excluir"
                />
            )}

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                variant={confirmationModal.variant}
                onConfirm={confirmationModal.onConfirm}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
