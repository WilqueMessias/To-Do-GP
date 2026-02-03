import React from 'react';
import type { Task } from '../services/api';
import {
    Calendar,
    AlertCircle,
    Clock,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Há ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Há ${diffInDays}d`;
};

const isOverdue = (dateStr: string, status: string) => {
    if (status === 'DONE') return false;
    return new Date(dateStr).getTime() < new Date().getTime();
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const priorityColors = {
        LOW: 'bg-emerald-100 text-emerald-700',
        MEDIUM: 'bg-amber-100 text-amber-700',
        HIGH: 'bg-rose-100 text-rose-700',
    };

    const overdue = isOverdue(task.dueDate, task.status);

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="w-full h-32 rounded-2xl border-2 border-dashed border-blue-200" />;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className={`
                glass-card group p-5 cursor-pointer 
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] 
                active:scale-[0.98] transition-all duration-300
                ${overdue ? 'ring-2 ring-rose-400/50' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${priorityColors[task.priority]}`}>
                    {task.priority === 'LOW' ? 'Baixa' : task.priority === 'MEDIUM' ? 'Média' : 'Alta'}
                </span>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock size={10} />
                        <span>{getTimeAgo(task.createdAt)}</span>
                    </div>
                    {overdue && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                            <AlertCircle size={10} />
                            <span>VENCIDA</span>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-slate-800 font-bold text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                {task.title}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                {task.description}
            </p>

            <div className="flex items-center gap-2 pt-3 border-t border-white/30 text-slate-400">
                <Calendar size={12} className={overdue ? 'text-rose-400' : ''} />
                <span className={`text-[11px] font-semibold ${overdue ? 'text-rose-500' : ''}`}>
                    {new Date(task.dueDate).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>
        </div>
    );
};
