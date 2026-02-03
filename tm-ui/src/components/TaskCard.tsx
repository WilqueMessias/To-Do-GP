import React from 'react';
import type { Task } from '../services/api';
import { Calendar, MoreVertical, AlertCircle } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

const priorityColors = {
    LOW: 'bg-blue-100 text-blue-700 border-blue-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    HIGH: 'bg-red-100 text-red-700 border-red-200',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
        >
            <div className="glass-card rounded-xl p-4 hover:-translate-y-1 transition-all duration-300 group relative">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                        {task.priority}
                    </span>
                    <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={14} />
                    </button>
                </div>
                <h4 className="font-semibold text-slate-800 mb-1 line-clamp-2">{task.title}</h4>
                <p className="text-slate-500 text-sm line-clamp-2 mb-3">{task.description}</p>
                <div className={`flex items-center text-[11px] gap-1 ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                    {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    {isOverdue && <span className="text-[9px] uppercase ml-1 border border-red-200 bg-red-50 text-red-600 px-1 rounded">Atrasado</span>}
                </div>
            </div>
        </div>
    );
};
