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
        <div ref={setNodeRef} className="flex flex-col flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg ${id === 'TODO' ? 'text-slate-700 dark:text-slate-300' :
                        id === 'DOING' ? 'text-blue-700 dark:text-blue-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}>
                        {title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div className="glass-panel rounded-2xl p-3 min-h-[150px] transition-colors duration-300 flex flex-col gap-3">
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="animate-enter"
                        >
                            <TaskCard task={task} onClick={() => onTaskClick(task)} />
                        </div>
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                        <p className="text-sm font-medium">Sem tarefas</p>
                    </div>
                )}
            </div>
        </div>
    );
};
