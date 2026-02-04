import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
    const getBrasiliaHour = () => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: 'America/Sao_Paulo',
        });
        return parseInt(formatter.format(new Date()));
    };

    const getAutoTheme = useCallback((): Theme => {
        const hour = getBrasiliaHour();
        return (hour >= 19 || hour < 7) ? 'dark' : 'light';
    }, []);

    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('tm-theme') as Theme;
        return saved || getAutoTheme();
    });

    // Handle theme class and storage
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('tm-theme', theme);
    }, [theme]);

    // Automatic transition logic
    useEffect(() => {
        const checkAutoTheme = () => {
            // Only auto-switch if the user hasn't explicitly set a preference in this session
            // or if we want to strictly follow the schedule. 
            // The user said "ativa automaticamente", so we'll check if a transition is needed.
            const targetTheme = getAutoTheme();
            const lastAutoCheck = sessionStorage.getItem('tm-last-auto-theme');

            if (targetTheme !== lastAutoCheck) {
                setTheme(targetTheme);
                sessionStorage.setItem('tm-last-auto-theme', targetTheme);
            }
        };

        checkAutoTheme();
        const interval = setInterval(checkAutoTheme, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [getAutoTheme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
};
