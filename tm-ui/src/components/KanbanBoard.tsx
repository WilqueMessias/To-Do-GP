import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import type { Task } from '../services/api';
import { taskService } from '../services/api';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
    onEditTask: (task: Task) => void;
    onTasksChange?: (tasks: Task[]) => void;
    tasks?: Task[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditTask, onTasksChange, tasks: externalTasks }) => {
    const [internalTasks, setInternalTasks] = useState<Task[]>([]);

    // Use external tasks if provided (for filtering), otherwise user internal state
    const tasks = externalTasks || internalTasks;

    // Helper to update tasks regardless of source
    const updateTasks = (newTasks: Task[]) => {
        setInternalTasks(newTasks);
        if (onTasksChange) onTasksChange(newTasks);
    };
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const loadTasks = async () => {
        try {
            const { data } = await taskService.getAll();
            updateTasks(data.content);
        } catch (error) {
            console.error('Failed to load tasks', error);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        if (onTasksChange) {
            onTasksChange(tasks);
        }
    }, [tasks, onTasksChange]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find((t) => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isOverAColumn = ['TODO', 'DOING', 'DONE'].includes(overId as string);
        // Logic for drag over remains similar but operates on local clone first
        // Note: For simplicity in this hybrid mode, we just update state. 
        // Ideally dnd-kit would drive this more cleanly.

        // ... (We need to refactor the functional update to use the helper)
        setInternalTasks((prev) => {
            const activeIndex = prev.findIndex((t) => t.id === activeId);
            const activeTask = prev[activeIndex];

            if (isOverAColumn) {
                const newStatus = overId as Task['status'];
                if (activeTask.status !== newStatus) {
                    const newTasks = [...prev];
                    newTasks[activeIndex] = { ...activeTask, status: newStatus };
                    if (onTasksChange) onTasksChange(newTasks);
                    return newTasks;
                }
                return prev;
            }

            const overIndex = prev.findIndex((t) => t.id === overId);
            const overTask = prev[overIndex];

            if (activeTask.status !== overTask.status) {
                const newTasks = [...prev];
                newTasks[activeIndex] = { ...activeTask, status: overTask.status };
                const reordered = arrayMove(newTasks, activeIndex, overIndex);
                if (onTasksChange) onTasksChange(reordered);
                return reordered;
            }

            const reordered = arrayMove(prev, activeIndex, overIndex);
            if (onTasksChange) onTasksChange(reordered);
            return reordered;
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const task = tasks.find((t) => t.id === active.id);
        if (!task) return;

        // Persist status change if different from original
        try {
            await taskService.update(task.id, { status: task.status });
        } catch (error) {
            console.error('Failed to update task status', error);
            loadTasks(); // Rollback
        }
    };

    const columns: { id: Task['status']; title: string }[] = [
        { id: 'TODO', title: 'A Fazer (To Do)' },
        { id: 'DOING', title: 'Em Progresso (Doing)' },
        { id: 'DONE', title: 'Concluído (Done)' },
    ];

    return (
        <div className="flex gap-8 p-8 justify-center overflow-x-auto min-h-[calc(100vh-80px)]">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={tasks.filter((t) => t.status === col.id)}
                        onTaskClick={onEditTask}
                    />
                ))}

                <DragOverlay>
                    {activeTask ? (
                        <div className="rotate-3 shadow-2xl">
                            <TaskCard task={activeTask} onClick={() => { }} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
