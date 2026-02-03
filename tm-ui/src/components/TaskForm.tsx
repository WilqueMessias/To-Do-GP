import React, { useState } from 'react';
import type { Task } from '../services/api';
import { taskService } from '../services/api';
import { X, Plus, Trash2, CheckSquare, Square, History } from 'lucide-react';
import type { Subtask } from '../services/api';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (action: 'create' | 'update' | 'delete', id?: string) => void;
    onError: (message: string) => void;
    taskToEdit?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSuccess, onError, taskToEdit }) => {
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [description, setDescription] = useState(taskToEdit?.description || '');
    const [priority, setPriority] = useState<Task['priority']>(taskToEdit?.priority || 'MEDIUM');
    const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? taskToEdit.dueDate.substring(0, 16) : '');
    const [status, setStatus] = useState<Task['status']>(taskToEdit?.status || 'TODO');
    const [subtasks, setSubtasks] = useState<Subtask[]>(taskToEdit?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
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
                subtasks
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

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { title: newSubtask, completed: false }]);
        setNewSubtask('');
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const toggleSubtask = (index: number) => {
        const updated = [...subtasks];
        const isChecking = !updated[index].completed;
        updated[index].completed = isChecking;

        // Smart Status Logic
        if (isChecking && status === 'TODO') {
            setStatus('DOING');
        }

        const allDone = updated.every(s => s.completed);
        if (allDone && status !== 'DONE' && updated.length > 0) {
            setStatus('DONE');
        } else if (!allDone && status === 'DONE') {
            setStatus('DOING');
        }

        setSubtasks(updated);
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

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div className="p-6 space-y-6">
                        {/* Essential Info */}
                        <section className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Título da Tarefa</label>
                                <input
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300"
                                    placeholder="Ex: Refatorar API de Autenticação"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição Técnica</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px] text-sm text-slate-600 placeholder:text-slate-300 resize-none"
                                    placeholder="Descreva os detalhes da implementação..."
                                />
                            </div>
                        </section>

                        {/* Metadata Grid */}
                        <section className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Prioridade</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="LOW">Baixa</option>
                                    <option value="MEDIUM">Média</option>
                                    <option value="HIGH">Alta</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status Atual</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="TODO">A Fazer</option>
                                    <option value="DOING">Em Progresso</option>
                                    <option value="DONE">Concluído</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Prazo de Entrega</label>
                                <input
                                    required
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </section>

                        {/* Checklist Section */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist de Passos</label>
                                <span className="text-[10px] font-black text-blue-500">{subtasks.filter(s => s.completed).length}/{subtasks.length}</span>
                            </div>
                            <div className="space-y-2 mb-3">
                                {subtasks.map((st, index) => (
                                    <div key={index} className="flex items-center gap-2 group bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all animate-enter">
                                        <button
                                            type="button"
                                            onClick={() => toggleSubtask(index)}
                                            className={`transition-all ${st.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-400'}`}
                                        >
                                            {st.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                        <span className={`text-sm flex-1 font-medium ${st.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                            {st.title}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeSubtask(index)}
                                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                    placeholder="Adicionar novo passo..."
                                    className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50/50"
                                />
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-90"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </section>

                        {/* Activity Feed Section */}
                        {taskToEdit && taskToEdit.activities && taskToEdit.activities.length > 0 && (
                            <section className="pt-2">
                                <div className="flex items-center gap-2 mb-4 text-slate-400">
                                    <History size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Logs de Atividade</span>
                                </div>
                                <div className="space-y-4 max-h-[160px] overflow-y-auto pr-3 custom-scrollbar">
                                    {taskToEdit.activities.map((activity) => (
                                        <div key={activity.id} className="relative pl-6 pb-4 last:pb-0">
                                            <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-slate-200 border-2 border-white outline outline-1 outline-slate-100" />
                                            <div className="absolute left-[3px] top-3 bottom-0 w-0.5 bg-slate-100 last:hidden" />
                                            <p className="text-[11px] text-slate-600 font-semibold leading-tight mb-1">{activity.message}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                                {new Date(activity.timestamp).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: 'short',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Actions footer */}
                    <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 flex flex-col gap-3">
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
                                            onSuccess('delete', taskToEdit.id);
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
