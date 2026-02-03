import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/api';
import type { Task } from '../services/api';
import type { ToastMessage } from '../components/Toast';

export const useKanbanTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

    const filteredTasks = tasks.filter(t =>
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
        refresh: loadTasks
    };
};
