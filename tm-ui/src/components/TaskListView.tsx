import React from 'react';
import type { Task } from '../services/api';
import { Star, Calendar, Clock } from 'lucide-react';


interface TaskListViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onEditTask }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    /* 
    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'HIGH': return 'text-rose-500 bg-rose-50 border-rose-100';
            case 'MEDIUM': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'LOW': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };
    */


    return (
        <div className="max-w-[1200px] mx-auto p-8 animate-enter">
            <div className="glass-panel overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data de Vencimento</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Importância</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                    Nenhuma tarefa encontrada.
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr
                                    key={task.id}
                                    onClick={() => onEditTask(task)}
                                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-block border ${task.status === 'DONE' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                                            task.status === 'DOING' ? 'text-blue-500 bg-blue-50 border-blue-100' :
                                                'text-slate-400 bg-slate-50 border-slate-100'
                                            }`}>
                                            {task.status === 'DONE' ? 'CONCLUÍDO' :
                                                task.status === 'DOING' ? 'EM CURSO' : 'PENDENTE'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${task.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <span className="text-[11px] text-slate-400 line-clamp-1">{task.description}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar size={14} className={task.overdue ? 'text-rose-500' : ''} />
                                            <span className={`text-xs font-semibold ${task.overdue ? 'text-rose-600 font-bold' : ''}`}>
                                                {formatDate(task.dueDate)}
                                            </span>
                                            {task.reminderEnabled && (
                                                <Clock size={12} className="text-blue-500 ml-1" />
                                            )}

                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <Star
                                                size={18}
                                                className={task.important ? 'text-amber-500' : 'text-slate-200 dark:text-slate-700'}
                                                fill={task.important ? 'currentColor' : 'none'}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
