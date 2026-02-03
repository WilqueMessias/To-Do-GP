import React, { useState, useEffect } from 'react';

export const SystemClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        });
    };

    return (
        <div className="flex items-center px-4 py-1.5 rounded-xl bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 select-none hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600 tabular-nums">
                    {formatTime(time)}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider border-l border-slate-300 pl-3">
                    {formatDate(time)}
                </span>
            </div>
        </div>
    );
};
