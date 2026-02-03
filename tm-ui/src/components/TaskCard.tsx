import React from 'react';
import type { Task } from '../services/api';
import { Calendar, MoreVertical } from 'lucide-react';
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
            className="bg-white rounded-md shadow-sm p-4 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group relative"
        >
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
            <div className="flex items-center text-slate-400 text-[11px] gap-1">
                <Calendar size={12} />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
        </div>
    );
};
