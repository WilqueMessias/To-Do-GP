import React, { memo } from 'react';
import type { Task } from '../services/api';
import {
    Calendar,
    AlertCircle,
    Clock,
    CheckSquare,
    Star,
    GripVertical,
    PlayCircle,
    CheckCircle2,
    RotateCcw,
    Undo2,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
    onUpdate?: (id: string, updates: Partial<Task>) => void;
}

interface TaskCardContentProps extends TaskCardProps {
    setNodeRef?: (node: HTMLElement | null) => void;
    style?: React.CSSProperties;
    attributes?: any;
    listeners?: any;
    isDragging?: boolean;
}

const isDateOnlyValue = (value?: string) => {
    if (!value) return true;
    if (!value.includes('T')) return true;
    return value.includes('T00:00') || value.includes('T23:59:59') || value.includes('T23:59');
};

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

export const TaskCardContent: React.FC<TaskCardContentProps> = ({
    task,
    onClick,
    onUpdate,
    setNodeRef,
    style,
    attributes,
    listeners,
    isDragging
}) => {
    const priorityColors = {
        LOW: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50',
        MEDIUM: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50',
        HIGH: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50',
    };

    const overdue = isOverdue(task.dueDate, task.status);
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const handlePriorityToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!onUpdate) return;

        const priorities: Task['priority'][] = ['LOW', 'MEDIUM', 'HIGH'];
        const currentIndex = priorities.indexOf(task.priority);
        const nextPriority = priorities[(currentIndex + 1) % priorities.length];
        onUpdate(task.id, { priority: nextPriority });
    };

    const handleStarToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onUpdate) {
            onUpdate(task.id, { important: !task.important });
        }
    };

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="w-full h-32 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/30 opacity-50" />;
    }

    return (
        <div
            ref={setNodeRef}

            onClick={() => onClick(task)}
            className={`
                glass-card group p-5 cursor-pointer relative
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] 
                active:scale-[0.98] transition-colors transition-shadow duration-300 touch-none will-change-transform
                select-none
                ${overdue ? 'ring-2 ring-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : ''}
                ${task.important ? 'border-amber-400/30 bg-amber-50/10 dark:bg-amber-900/5' : ''}
            `}
            style={{
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                ...style, // Pass through style (transform/transition) from parent
            }}
        >
            {/* Drag Handle - Isolated from card click */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-blue-500 cursor-grab active:cursor-grabbing transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                onClick={(e) => e.stopPropagation()}
                title="Arraste para mover"
            >
                <GripVertical size={16} />
            </div>

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleStarToggle}
                        className={`p-1 rounded-full transition-all active:scale-90 ${task.important ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                        title={task.important ? "Remover importância" : "Marcar como importante"}
                    >
                        <Star size={16} fill={task.important ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        type="button"
                        onClick={handlePriorityToggle}
                        title="Clique para alternar prioridade"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border transition-all hover:scale-105 active:scale-95 ${priorityColors[task.priority]}`}
                    >
                        {task.priority === 'LOW' ? 'Baixa' : task.priority === 'MEDIUM' ? 'MÉDIA' : 'ALTA'}
                    </button>
                </div>
                <div className="flex flex-col items-end gap-1 mr-6"> {/* Added margin for drag handle */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock size={10} />
                        <span>{getTimeAgo(task.createdAt)}</span>
                    </div>
                    {overdue && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                            <AlertCircle size={10} />
                            <span>VENCIDA</span>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-[var(--text-main)] font-bold text-sm leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4 cursor-default">
                {task.title}
            </h3>
            <p className="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-4 cursor-default">
                {task.description}
            </p>

            {totalSubtasks > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <CheckSquare size={10} className={completedSubtasks === totalSubtasks ? 'text-emerald-500' : 'text-blue-500'} />
                            <span>{completedSubtasks}/{totalSubtasks} PASSO{totalSubtasks > 1 ? 'S' : ''}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-white/50 dark:border-white/5">
                        <div
                            className={`h-full transition-all duration-500 ${completedSubtasks === totalSubtasks ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/30 dark:border-white/5 mt-auto">
                {/* Date Picker / Display */}
                <div
                    className="flex items-center gap-2 text-slate-400 dark:text-slate-500 transition-colors"
                >
                    <Calendar size={12} className={overdue ? 'text-rose-400' : ''} />
                    <div className="relative">
                        <span className="text-[11px] font-semibold">
                            {task.dueDate ? (
                                isDateOnlyValue(task.dueDate)
                                    ? new Date(task.dueDate).toLocaleDateString('pt-BR', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    })
                                    : new Date(task.dueDate).toLocaleString('pt-BR', {
                                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })
                            ) : 'Definir data'}
                        </span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 opacity-100 transition-opacity">
                    {task.status === 'TODO' && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdate && onUpdate(task.id, { status: 'DOING' }); }}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                title="Começar (Mover para Em Progresso)"
                            >
                                <PlayCircle size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdate && onUpdate(task.id, { status: 'DONE' }); }}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                title="Concluir"
                            >
                                <CheckCircle2 size={14} />
                            </button>
                        </>
                    )}

                    {task.status === 'DOING' && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdate && onUpdate(task.id, { status: 'TODO' }); }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Voltar para A Fazer"
                            >
                                <Undo2 size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdate && onUpdate(task.id, { status: 'DONE' }); }}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                title="Concluir"
                            >
                                <CheckCircle2 size={14} />
                            </button>
                        </>
                    )}

                    {task.status === 'DONE' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onUpdate && onUpdate(task.id, { status: 'TODO' }); }}
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all flex items-center gap-1.5 px-2"
                            title="Refazer (Voltar para A Fazer)"
                        >
                            <RotateCcw size={12} />
                            <span className="text-[10px] font-bold">Refazer</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const TaskCardComponent: React.FC<TaskCardProps> = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props.task.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <TaskCardContent
            {...props}
            setNodeRef={setNodeRef}
            style={style}
            attributes={attributes}
            listeners={listeners}
            isDragging={isDragging}
        />
    );
};

export const TaskCard = memo(TaskCardComponent);
