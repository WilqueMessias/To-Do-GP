import React from 'react';
import type { Task } from '../services/api';
import { TrendingUp, Clock, CheckCircle, BarChart2 } from 'lucide-react';

interface AnalyticsPanelProps {
    tasks: Task[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ tasks }) => {
    const completedTasks = tasks.filter(t => t.status === 'DONE' && t.completedAt);

    // Calculate Average Cycle Time (from Creation to Completion)
    const calculateAvgCycleTime = () => {
        if (completedTasks.length === 0) return '0h';
        const totalMs = completedTasks.reduce((acc, t) => {
            const start = new Date(t.createdAt!).getTime();
            const end = new Date(t.completedAt!).getTime();
            return acc + (end - start);
        }, 0);
        const avgHours = totalMs / (1000 * 60 * 60 * completedTasks.length);
        return avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`;
    };

    // Calculate Efficiency (Subtasks completed / total)
    const calculateEfficiency = () => {
        const tasksWithSubtasks = tasks.filter(t => t.subtasks && t.subtasks.length > 0);
        if (tasksWithSubtasks.length === 0) return '100%';
        const total = tasksWithSubtasks.reduce((acc, t) => acc + t.subtasks!.length, 0);
        const done = tasksWithSubtasks.reduce((acc, t) => acc + t.subtasks!.filter(s => s.completed).length, 0);
        return `${Math.round((done / total) * 100)}%`;
    };

    const stats = [
        {
            label: 'Taxa de Entrega',
            value: tasks.length > 0 ? `${Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100)}%` : '0%',
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Tempo Ciclo Médio',
            value: calculateAvgCycleTime(),
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Eficiência Checklist',
            value: calculateEfficiency(),
            icon: CheckCircle,
            color: 'text-violet-500',
            bg: 'bg-violet-50'
        },
        {
            label: 'Velocity (7d)',
            value: completedTasks.filter(t => {
                const now = new Date();
                const completedDate = new Date(t.completedAt!);
                return (now.getTime() - completedDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
            }).length.toString(),
            icon: BarChart2,
            color: 'text-amber-500',
            bg: 'bg-amber-50'
        }
    ];

    return (
        <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-panel p-4 rounded-3xl border border-white/40 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className={`absolute -right-2 -top-2 w-16 h-16 ${stat.bg} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`} />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-black text-slate-700 dark:text-slate-200 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};
