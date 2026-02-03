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

interface KanbanBoardProps {
    onEditTask: (task: Task) => void;
    onUpdateTask?: (id: string, updates: Partial<Task>) => void;
    onTasksChange?: (tasks: Task[]) => void;
    tasks?: Task[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditTask, onUpdateTask, onTasksChange, tasks = [] }) => {
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

    // History & Modal State
    const [history, setHistory] = useState<Task[]>([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Load history from local storage on mount
    React.useEffect(() => {
        const savedHistory = localStorage.getItem('task_cleanup_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, []);

    // Save history when it changes
    React.useEffect(() => {
        localStorage.setItem('task_cleanup_history', JSON.stringify(history));
    }, [history]);

    const handleClearCompleted = async () => {
        const completedTasks = internalTasks.filter(t => t.status === 'DONE');
        if (completedTasks.length === 0) return;

        // Optimistic update
        const remainingTasks = internalTasks.filter(t => t.status !== 'DONE');
        setInternalTasks(remainingTasks);
        // Sync with parent
        if (onTasksChange) onTasksChange(remainingTasks);

        // API Delete & History Update
        const newHistory = [...history];
        for (const task of completedTasks) {
            try {
                await taskService.delete(task.id);
                // Add to history with current timestamp as "deleted at" roughly
                newHistory.unshift({ ...task, completedAt: new Date().toISOString() });
            } catch (error) {
                console.error(`Failed to delete task ${task.id}`, error);
            }
        }
        setHistory(newHistory);
    };

    const handleRestoreFromHistory = async (taskToRestore: Task) => {
        try {
            const restored = await taskService.restore(taskToRestore.id);
            // Remove from history
            setHistory(prev => prev.filter(t => t.id !== taskToRestore.id));

            // Add back to board
            const newTasks = [...internalTasks, restored];
            setInternalTasks(newTasks);
            if (onTasksChange) onTasksChange(newTasks);
        } catch (error) {
            console.error("Failed to restore task", error);
        }
    };

    const handleClearHistory = () => {
        if (confirm('Tem certeza? Isso removerá o histórico local permanentemente.')) {
            setHistory([]);
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
            await taskService.update(task.id, { status: task.status });
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
        <div className="flex gap-8 p-8 justify-center overflow-x-auto min-h-[calc(100vh-80px)]">
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
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={internalTasks.filter((t) => t.status === col.id)}
                        onTaskClick={onEditTask}
                        onUpdateTask={onUpdateTask}
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
                onClearHistory={handleClearHistory}
            />
        </div>
    );
};
