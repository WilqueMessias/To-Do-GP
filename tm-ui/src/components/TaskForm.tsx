import React, { useState } from 'react';
import type { Task } from '../services/api';
import { taskService } from '../services/api';
import { X } from 'lucide-react';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (action: 'create' | 'update' | 'delete') => void;
    onError: (message: string) => void;
    taskToEdit?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSuccess, onError, taskToEdit }) => {
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [description, setDescription] = useState(taskToEdit?.description || '');
    const [priority, setPriority] = useState<Task['priority']>(taskToEdit?.priority || 'MEDIUM');
    const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
    const [status] = useState<Task['status']>(taskToEdit?.status || 'TODO');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title,
                description,
                priority,
                status,
                dueDate: new Date(dueDate).toISOString(),
            };

            if (taskToEdit) {
                await taskService.update(taskToEdit.id, payload);
                onSuccess('update');
            } else {
                await taskService.create(payload);
                onSuccess('create');
            }
            onClose();
        } catch (error) {
            onError('Falha ao salvar tarefa. Verifique a conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md overflow-hidden animate-enter rounded-3xl">
                <div className="flex justify-between items-center p-6 border-b border-white/20">
                    <h2 className="text-xl font-bold text-slate-800">
                        {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enriqueça sua tarefa..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                            placeholder="Descreva os detalhes..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data Limite *</label>
                            <input
                                required
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Salvando...' : 'Salvar Tarefa'}
                            </button>
                        </div>

                        {taskToEdit && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                                        setLoading(true);
                                        try {
                                            await taskService.delete(taskToEdit.id);
                                            onSuccess('delete');
                                            onClose();
                                        } catch (e) {
                                            onError('Falha ao excluir tarefa');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                className="w-full py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Excluir Tarefa
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
