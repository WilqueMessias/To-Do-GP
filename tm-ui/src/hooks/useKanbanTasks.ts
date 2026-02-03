import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/api';
import type { Task } from '../services/api';
import type { ToastMessage } from '../components/Toast';

export const useKanbanTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'none', direction: 'asc' });

    const addToast = useCallback((type: 'success' | 'error', message: string, action?: ToastMessage['action']) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message, action }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await taskService.getAll();
            setTasks(data.content);
        } catch (error) {
            addToast('error', 'Falha ao carregar inteligência de tarefas');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortConfig.key === 'none') return 0;

        const dir = sortConfig.direction === 'asc' ? 1 : -1;

        if (sortConfig.key === 'title') {
            return a.title.localeCompare(b.title) * dir;
        }

        if (sortConfig.key === 'dueDate') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
        }

        if (sortConfig.key === 'priority') {
            const weights = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return (weights[b.priority] - weights[a.priority]) * dir;
        }

        if (sortConfig.key === 'status') {
            const weights = { 'TODO': 1, 'DOING': 2, 'DONE': 3 };
            return (weights[a.status] - weights[b.status]) * dir;
        }

        if (sortConfig.key === 'important') {
            return (a.important === b.important ? 0 : a.important ? -1 : 1) * dir;
        }

        return 0;
    });

    const filteredTasks = sortedTasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );

    const updateTaskStateLocal = useCallback((updatedTasks: Task[] | ((prev: Task[]) => Task[])) => {
        if (typeof updatedTasks === 'function') {
            setTasks(updatedTasks);
        } else {
            // Merge logic to prevent data loss during filtering
            setTasks(prev => prev.map(t => {
                const updated = updatedTasks.find(ut => ut.id === t.id);
                return updated || t;
            }));
        }
    }, []);

    const handleUpdateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        try {
            // Optimistic UI update
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

            const response = await taskService.update(id, updates);

            // Update with actual response data
            setTasks(prev => prev.map(t => t.id === id ? response.data : t));
            addToast('success', 'Tarefa atualizada!');
        } catch (error) {
            console.error('Failed to update task:', error);
            addToast('error', 'Falha ao atualizar tarefa');
            loadTasks();
        }
    }, [addToast, loadTasks]);

    const handleSuccess = useCallback((action: 'create' | 'update' | 'delete', taskId?: string) => {
        const messages = {
            create: 'Tarefa criada com sucesso!',
            update: 'Tarefa atualizada com sucesso!',
            delete: 'Tarefa removida com sucesso!'
        };

        if (action === 'delete' && taskId) {
            addToast('success', messages[action], {
                label: 'Desfazer',
                onClick: async () => {
                    try {
                        await taskService.restore(taskId);
                        addToast('success', 'Tarefa restaurada!');
                        loadTasks();
                    } catch (e) {
                        addToast('error', 'Falha ao restaurar tarefa');
                    }
                }
            });
        } else {
            addToast('success', messages[action]);
        }
        loadTasks();
    }, [addToast, loadTasks]);

    return {
        tasks: filteredTasks,
        allTasks: tasks,
        search,
        setSearch,
        isLoading,
        toasts,
        removeToast,
        addToast,
        updateTaskStateLocal,
        handleSuccess,
        handleUpdateTask,
        sortConfig,
        setSortConfig,
        refresh: loadTasks
    };
};
