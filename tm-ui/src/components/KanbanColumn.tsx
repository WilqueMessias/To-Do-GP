import React from 'react';
import type { Task } from '../services/api';
import { TaskCard } from './TaskCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
    id: 'TODO' | 'DOING' | 'DONE';
    title: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onTaskClick }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex flex-col gap-4 w-80">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm flex items-center gap-2">
                    {title}
                    <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </h3>
            </div>
            <div
                ref={setNodeRef}
                className="bg-slate-100 rounded-lg p-4 min-h-[500px] flex flex-col gap-4"
            >
                <SortableContext
                    id={id}
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm italic">
                            Empty
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};
