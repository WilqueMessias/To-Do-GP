import React, { useState, useEffect } from 'react';
import type { Task, Subtask } from '../services/api';
import { taskService } from '../services/api';
import { X, Plus, Trash2, CheckSquare, Square, History, Sparkles, Star, Calendar } from 'lucide-react';



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
    const [important, setImportant] = useState(taskToEdit?.important || false);
    const [reminderEnabled, setReminderEnabled] = useState(taskToEdit?.reminderEnabled || false);
    const [reminderTime, setReminderTime] = useState(taskToEdit?.reminderTime ? taskToEdit.reminderTime.substring(0, 16) : '');
    const [status, setStatus] = useState<Task['status']>(taskToEdit?.status || 'TODO');
    const [hasTime, setHasTime] = useState(() => {
        if (!taskToEdit?.dueDate) return false;
        // Check for sentinels: Start of day (legacy) or End of day (new sort fix)
        if (taskToEdit.dueDate.includes('T00:00:00') || taskToEdit.dueDate.includes('T23:59:59')) return false;
        return taskToEdit.dueDate.includes('T');
    });
    // Let's simplify hasTime initialization: if it has a non-zero time or if we want to default to true when editing a task with time.
    // Actually, let's just use a simple heuristic: if it has 'T' and isn't just a date placeholder.

    const [subtasks, setSubtasks] = useState<Subtask[]>(taskToEdit?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<{ date: string, label: string } | null>(null);
    const modalRef = React.useRef<HTMLDivElement>(null);

    // Sync state when taskToEdit changes
    useEffect(() => {
        if (isOpen) {
            setTitle(taskToEdit?.title || '');
            setDescription(taskToEdit?.description || '');
            setPriority(taskToEdit?.priority || 'MEDIUM');
            setDueDate(taskToEdit?.dueDate ? taskToEdit.dueDate.substring(0, 16) : '');
            setImportant(taskToEdit?.important || false);
            setReminderEnabled(taskToEdit?.reminderEnabled || false);
            setReminderTime(taskToEdit?.reminderTime ? taskToEdit.reminderTime.substring(0, 16) : '');
            setStatus(taskToEdit?.status || 'TODO');
            setSubtasks(taskToEdit?.subtasks || []);

            const isDateOnly = taskToEdit?.dueDate ? !taskToEdit.dueDate.includes('T') || taskToEdit.dueDate.includes('00:00:00') : true;
            setHasTime(!isDateOnly);
        }
    }, [isOpen, taskToEdit]);

    // Smart NL Parsing Engine
    useEffect(() => {

        if (!title || taskToEdit) return;

        const text = title.toLowerCase();
        let targetDate = new Date();
        let found = false;
        let label = '';

        if (text.includes('hoje') || text.includes('today')) {
            targetDate.setHours(23, 59, 0, 0);
            found = true;
            label = 'Hoje';
        } else if (text.includes('amanhã') || text.includes('tomorrow')) {
            targetDate.setDate(targetDate.getDate() + 1);
            targetDate.setHours(12, 0, 0, 0);
            found = true;
            label = 'Amanhã';
        } else if (text.includes('próxima semana') || text.includes('next week')) {
            targetDate.setDate(targetDate.getDate() + 7);
            targetDate.setHours(9, 0, 0, 0);
            found = true;
            label = 'Próxima Semana';
        } else {
            // Weekday detection
            const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
            for (let i = 0; i < weekdays.length; i++) {
                if (text.includes(weekdays[i])) {
                    const currentDay = targetDate.getDay();
                    let daysToAdd = (i - currentDay + 7) % 7;
                    if (daysToAdd === 0) daysToAdd = 7; // Target next week if same day
                    targetDate.setDate(targetDate.getDate() + daysToAdd);
                    targetDate.setHours(10, 0, 0, 0);
                    found = true;
                    label = weekdays[i].charAt(0).toUpperCase() + weekdays[i].slice(1);
                    break;
                }
            }
        }

        // Relative "em X dias" detection
        const dayMatch = text.match(/em (\d+) dias/);
        if (dayMatch && !found) {
            targetDate.setDate(targetDate.getDate() + parseInt(dayMatch[1]));
            targetDate.setHours(18, 0, 0, 0);
            found = true;
            label = `em ${dayMatch[1]} dias`;
        }

        if (found) {
            const formatted = targetDate.toISOString().substring(0, 16);
            if (formatted !== dueDate) {
                setSuggestion({ date: formatted, label });
            } else {
                setSuggestion(null);
            }
        } else {
            setSuggestion(null);
        }
    }, [title, dueDate, taskToEdit]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if clicking exactly the backdrop, not bubbles from content
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (reminderEnabled) {
            if (!reminderTime) {
                onError("Por favor, defina o horário do alerta.");
                setLoading(false);
                return;
            }
            const rTime = new Date(reminderTime).getTime();
            const dTime = new Date(dueDate).getTime();
            const now = new Date().getTime();

            if (rTime <= now) {
                onError("O alerta não pode ser definido para o passado.");
                setLoading(false);
                return;
            }
            if (dueDate && rTime >= dTime) {
                onError("O alerta deve ser anterior ao prazo de entrega.");
                setLoading(false);
                return;
            }
        }

        try {
            let finalDueDate = null;
            if (dueDate) {
                if (hasTime) {
                    finalDueDate = new Date(dueDate).toISOString();
                } else {
                    // Force end of day for date-only tasks to ensure they are at the top of the day range
                    const datePart = dueDate.includes('T') ? dueDate.split('T')[0] : dueDate;
                    if (datePart) {
                        finalDueDate = new Date(`${datePart}T23:59:59.000Z`).toISOString();
                    }
                }
            }

            const payload = {
                title,
                description,
                priority,
                status,
                dueDate: finalDueDate,
                important,
                reminderEnabled: false,
                reminderTime: undefined,
                subtasks
            };



            if (taskToEdit) {
                await taskService.update(taskToEdit.id, payload as any);
                onSuccess('update');
            } else {
                await taskService.create(payload as any);
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
        setSubtasks(subtasks.filter((_, i: number) => i !== index));
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
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
            onClick={handleBackdropClick}
        >
            <div ref={modalRef} className="glass-panel w-full max-w-md overflow-hidden animate-enter rounded-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        {taskToEdit ? 'Editar Tarefa' : 'Nova Demanda'}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setImportant(!important)}
                            className={`p-2 rounded-xl transition-all ${important ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <Star size={20} fill={important ? "currentColor" : "none"} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div className="p-6 space-y-6">
                        {/* Essential Info */}
                        <section className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Título da Tarefa</label>
                                    <div className="flex gap-2">
                                        {title && (
                                            <button
                                                type="button"
                                                onClick={() => setTitle('')}
                                                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                                            >
                                                Limpar
                                            </button>
                                        )}
                                        {suggestion && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDueDate(suggestion.date);
                                                    setSuggestion(null);
                                                }}
                                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 animate-pulse hover:animate-none transition-all"
                                            >
                                                <Sparkles size={10} />
                                                <span>Sugerir {suggestion.label}?</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="relative group/input">
                                    <input
                                        required
                                        autoFocus
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm caret-blue-600 dark:caret-blue-400"
                                        placeholder="Ex: Refatorar API amanhã"
                                    />
                                    {title && (
                                        <button
                                            type="button"
                                            onClick={() => setTitle('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover/input:opacity-100 transition-all rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                            title="Limpar título"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Descrição Técnica</label>
                                    {description && (
                                        <button
                                            type="button"
                                            onClick={() => setDescription('')}
                                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                                <div className="relative group/textarea">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px] text-sm text-slate-600 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none shadow-sm caret-blue-600 dark:caret-blue-400"
                                        placeholder="Descreva os detalhes da implementação..."
                                    />
                                    {description && (
                                        <button
                                            type="button"
                                            onClick={() => setDescription('')}
                                            className="absolute right-3 top-3 p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover/textarea:opacity-100 transition-all rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                            title="Limpar descrição"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>


                        </section>

                        {/* Metadata Grid */}
                        <section className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Prioridade</label>
                                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-black transition-all whitespace-nowrap ${priority === p
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-md dark:bg-blue-600 dark:border-blue-600'
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                                }`}

                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${p === 'HIGH' ? 'bg-rose-500' : p === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`} />
                                            {p === 'LOW' ? 'BAIXA' : p === 'MEDIUM' ? 'MÉDIA' : 'ALTA'}

                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status Atual</label>
                                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                                    {(['TODO', 'DOING', 'DONE'] as const).map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatus(s)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-black transition-all whitespace-nowrap ${status === s
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-md dark:bg-blue-600 dark:border-blue-600'
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                                }`}

                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${s === 'DONE' ? 'bg-emerald-500' : s === 'DOING' ? 'bg-blue-500' : 'bg-slate-300'
                                                }`} />
                                            {s === 'TODO' ? 'FAZER' : s === 'DOING' ? 'EM CURSO' : 'FEITO'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prazo de Entrega</label>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                                            <button
                                                type="button"
                                                onClick={() => setHasTime(false)}
                                                className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${!hasTime ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                            >
                                                SÓ DATA
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHasTime(true)}
                                                className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${hasTime ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                            >
                                                DATA E HORÁRIO
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative group/date">
                                        <input
                                            type={hasTime ? "datetime-local" : "date"}
                                            value={hasTime ? dueDate : dueDate.split('T')[0]}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (hasTime) {
                                                    setDueDate(val);
                                                } else {
                                                    setDueDate(val ? val + 'T00:00' : '');
                                                }
                                            }}
                                            onDoubleClick={(e) => e.currentTarget.showPicker()}
                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans caret-blue-600 dark:caret-blue-400 [&::-webkit-calendar-picker-indicator]:hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                // Trigger the native picker on the input sibling
                                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                input.showPicker();
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                                            title={hasTime ? "Selecionar data e hora" : "Selecionar data"}
                                        >
                                            <Calendar size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </section>

                        {/* Checklist Section */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist de Passos</label>
                                <span className="text-[10px] font-black text-blue-500">{subtasks.filter(s => s.completed).length}/{subtasks.length}</span>
                            </div>
                            <div className="space-y-2 mb-3">
                                {subtasks.map((st: Subtask, index: number) => (
                                    <div key={index} className="flex items-center gap-2 group bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-sm transition-all animate-enter">
                                        <button
                                            type="button"
                                            onClick={() => toggleSubtask(index)}
                                            className={`transition-all ${st.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-blue-400'}`}
                                        >
                                            {st.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                        <span className={`text-sm flex-1 font-medium ${st.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
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
                                    className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 caret-blue-600 dark:caret-blue-400"
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
                                    <div className="flex flex-col gap-4">
                                        {taskToEdit.activities?.slice().reverse().map((activity: any) => (
                                            <div key={activity.id} className="relative pl-6 pb-2 border-l-2 border-slate-100 dark:border-white/5 last:border-0 group/log">
                                                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/20 shadow-sm group-hover/log:scale-125 transition-transform" />
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-200 leading-relaxed">
                                                    {activity.message}
                                                </p>
                                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5 block tracking-widest">
                                                    {new Date(activity.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </section>
                        )}
                    </div>

                    {/* Actions footer */}
                    <div className="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-white/5 p-6 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
