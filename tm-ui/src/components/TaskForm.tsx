import React, { useState } from 'react';
import type { Task } from '../services/api';
import { taskService } from '../services/api';
import { X } from 'lucide-react';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    taskToEdit?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSuccess, taskToEdit }) => {
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
            } else {
                await taskService.create(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-800">
                        {taskToEdit ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enriqueça sua tarefa..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                            placeholder="Descreva os detalhes..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
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
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Saving...' : 'Save Task'}
                            </button>
                        </div>

                        {taskToEdit && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete this task?')) {
                                        setLoading(true);
                                        try {
                                            await taskService.delete(taskToEdit.id);
                                            onSuccess();
                                            onClose();
                                        } catch (e) {
                                            alert('Failed to delete task');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                className="w-full py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Delete Task
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
