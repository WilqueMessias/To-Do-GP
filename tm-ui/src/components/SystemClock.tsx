import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const SystemClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl select-none group hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-blue-400 group-hover:scale-110 transition-transform">
                <Clock size={18} className="animate-pulse" />
            </div>
            <div className="flex items-baseline gap-3">
                <span className="text-xl font-black text-slate-800 tabular-nums">
                    {formatTime(time)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">
                    {formatDate(time)}
                </span>
            </div>
        </div>
    );
};
