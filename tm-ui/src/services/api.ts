import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
});

export interface Activity {
    id: string;
    message: string;
    timestamp: string;
}

export interface Subtask {
    id?: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'DOING' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: string;
    important: boolean;
    reminderEnabled: boolean;
    reminderTime?: string;
    overdue?: boolean;
    createdAt?: string;



    completedAt?: string;
    subtasks?: Subtask[];
    activities?: Activity[];
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const taskService = {
    getAll: (status?: string, page = 0, size = 100) =>
        api.get<PaginatedResponse<Task>>('/tasks', { params: { status, page, size } }),
    getById: (id: string) => api.get<Task>(`/tasks/${id}`),
    create: (task: Omit<Task, 'id' | 'createdAt'>) => api.post<Task>('/tasks', task),
    update: (id: string, task: Partial<Task>) => api.put<Task>(`/tasks/${id}`, task),
    delete: (id: string) => api.delete(`/tasks/${id}`),
    restore: (id: string) => api.post<Task>(`/tasks/${id}/restore`),
    hardDelete: (id: string) => api.delete(`/tasks/${id}/hard`),
    clearHistory: () => api.delete('/tasks/history'),
    restoreAllHistory: () => api.post('/tasks/history/restore'),
    getHistory: () => api.get<Task[]>('/tasks/history'),
};
