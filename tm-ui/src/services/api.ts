import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'DOING' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: string;
    createdAt?: string;
}

export const taskService = {
    getAll: (status?: string) => api.get<Task[]>('/tasks', { params: { status } }),
    getById: (id: string) => api.get<Task>(`/tasks/${id}`),
    create: (task: Omit<Task, 'id' | 'createdAt'>) => api.post<Task>('/tasks', task),
    update: (id: string, task: Partial<Task>) => api.put<Task>(`/tasks/${id}`, task),
    delete: (id: string) => api.delete(`/tasks/${id}`),
};
