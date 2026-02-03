import React, { useState } from 'react';
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

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditTask, onTasksChange, tasks = [] }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [activeTask, setActiveTask] = useState<Task | null>(null);

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
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return;

        const activeTask = tasks[activeIndex];

        if (isOverAColumn) {
            const newStatus = overId as Task['status'];
            if (activeTask.status !== newStatus) {
                const newTasks = [...tasks];
                newTasks[activeIndex] = { ...activeTask, status: newStatus };
                if (onTasksChange) onTasksChange(newTasks);
            }
            return;
        }

        const overIndex = tasks.findIndex((t) => t.id === overId);
        if (overIndex === -1) return;

        const overTask = tasks[overIndex];

        if (activeTask.status !== overTask.status) {
            const newTasks = [...tasks];
            newTasks[activeIndex] = { ...activeTask, status: overTask.status };
            const reordered = arrayMove(newTasks, activeIndex, overIndex);
            if (onTasksChange) onTasksChange(reordered);
            return;
        }

        const reordered = arrayMove(tasks, activeIndex, overIndex);
        if (onTasksChange) onTasksChange(reordered);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const task = tasks.find((t) => t.id === active.id);
        if (!task) return;

        try {
            await taskService.update(task.id, { status: task.status });
        } catch (error) {
            console.error('Failed to persist task movement:', error);
            // Parent App.tsx will handle refresh if needed, 
            // but we avoid window.location.reload here.
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
