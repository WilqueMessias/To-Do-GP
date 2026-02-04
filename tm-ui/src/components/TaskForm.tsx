import React, { useState, useEffect } from 'react';
import type { Task, Subtask } from '../services/api';
import { taskService } from '../services/api';
import { X, Plus, Trash2, CheckSquare, Square, History, Sparkles, Star, Calendar } from 'lucide-react';
import { format, parseISO, isValid, addDays, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';



interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (action: 'create' | 'update' | 'delete', id?: string) => void;
    onError: (message: string) => void;
    taskToEdit?: Task;
    onTaskUpdated?: (task: Task) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSuccess, onError, taskToEdit, onTaskUpdated }) => {
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [description, setDescription] = useState(taskToEdit?.description || '');
    const [priority, setPriority] = useState<Task['priority']>(taskToEdit?.priority || 'LOW');

    const getNowForInput = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");

    const formatDisplayDate = (value: string, withTime: boolean) => {
        if (!value) return '';
        const date = parseISO(value);
        if (!isValid(date)) return '';
        return format(date, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", { locale: ptBR });
    };

    const isDateOnlyValue = (value?: string) => {
        if (!value) return true;
        return value.includes('T00:00') || value.includes('T23:59:59') || value.includes('T23:59');
    };

    const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? taskToEdit.dueDate.substring(0, 16) : getNowForInput());
    const [important, setImportant] = useState(taskToEdit?.important || false);
    const [reminderEnabled, setReminderEnabled] = useState(taskToEdit?.reminderEnabled || false);
    const [reminderTime, setReminderTime] = useState(taskToEdit?.reminderTime ? taskToEdit.reminderTime.substring(0, 16) : '');
    const [status, setStatus] = useState<Task['status']>(taskToEdit?.status || 'TODO');
    const [hasTime, setHasTime] = useState(() => !isDateOnlyValue(taskToEdit?.dueDate));
    // Let's simplify hasTime initialization: if it has a non-zero time or if we want to default to true when editing a task with time.
    // Actually, let's just use a simple heuristic: if it has 'T' and isn't just a date placeholder.
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState('');
    const [pickerTime, setPickerTime] = useState('');
    const [activeTimeColumn, setActiveTimeColumn] = useState<'hour' | 'minute'>('hour');
    const [timeTabStarted, setTimeTabStarted] = useState(false);
    const [typeBuffer, setTypeBuffer] = useState('');
    const typeTimerRef = React.useRef<number | null>(null);

    const [subtasks, setSubtasks] = useState<Subtask[]>(taskToEdit?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<{ date: string, label: string } | null>(null);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const pickerRef = React.useRef<HTMLDivElement>(null);
    const hourListRef = React.useRef<HTMLDivElement>(null);
    const minuteListRef = React.useRef<HTMLDivElement>(null);
    const pickerDateInputRef = React.useRef<HTMLInputElement>(null);

    const handleSelectAllOnDoubleClick = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        if (typeof target.select === 'function') {
            target.select();
        }
    };

    const openPicker = () => setIsPickerOpen(true);
    const closePicker = () => setIsPickerOpen(false);
    const applyPicker = () => {
        if (!pickerDate) {
            closePicker();
            return;
        }
        if (hasTime) {
            const timePart = pickerTime || '00:00';
            setDueDate(`${pickerDate}T${timePart}`);
        } else {
            setDueDate(`${pickerDate}T00:00`);
        }
        closePicker();
    };
    const setPickerToday = () => {
        const now = new Date();
        setPickerDate(format(now, 'yyyy-MM-dd'));
        if (hasTime) {
            setPickerTime(format(now, 'HH:mm'));
        }
    };
    const setPickerTomorrow = () => {
        const tomorrow = addDays(new Date(), 1);
        setPickerDate(format(tomorrow, 'yyyy-MM-dd'));
        if (hasTime && !pickerTime) {
            setPickerTime('09:00');
        }
    };

    // Sync state when taskToEdit changes
    useEffect(() => {
        if (isOpen) {
            setTitle(taskToEdit?.title || '');
            setDescription(taskToEdit?.description || '');
            setPriority(taskToEdit?.priority || 'LOW');
            setDueDate(taskToEdit?.dueDate ? taskToEdit.dueDate.substring(0, 16) : getNowForInput());
            setImportant(taskToEdit?.important || false);
            setReminderEnabled(taskToEdit?.reminderEnabled || false);
            setReminderTime(taskToEdit?.reminderTime ? taskToEdit.reminderTime.substring(0, 16) : '');
            setStatus(taskToEdit?.status || 'TODO');
            setSubtasks(taskToEdit?.subtasks || []);

            setHasTime(!isDateOnlyValue(taskToEdit?.dueDate));
        }
    }, [isOpen, taskToEdit]);

    useEffect(() => {
        if (!isPickerOpen) return;
        const current = dueDate || getNowForInput();
        const [datePart, timePart] = current.split('T');
        setPickerDate(datePart);
        setPickerTime(timePart ? timePart.substring(0, 5) : '');
        setTypeBuffer('');
        setActiveTimeColumn('hour');
        setTimeTabStarted(false);
        if (typeTimerRef.current) {
            window.clearTimeout(typeTimerRef.current);
            typeTimerRef.current = null;
        }
    }, [isPickerOpen, dueDate]);

    useEffect(() => {
        if (!isPickerOpen || !pickerRef.current) return;
        pickerRef.current.focus();
    }, [isPickerOpen]);

    useEffect(() => {
        if (!isPickerOpen || !pickerDateInputRef.current) return;
        const input = pickerDateInputRef.current;
        input.focus();
        input.select();
        if (typeof input.showPicker === 'function') {
            input.showPicker();
        }
    }, [isPickerOpen]);

    useEffect(() => {
        if (!isPickerOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (pickerRef.current && !pickerRef.current.contains(target)) {
                closePicker();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isPickerOpen]);

    useEffect(() => {
        if (!isPickerOpen) return;
        const handlePickerKeys = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                applyPicker();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closePicker();
            }
        };
        window.addEventListener('keydown', handlePickerKeys, true);
        return () => window.removeEventListener('keydown', handlePickerKeys, true);
    }, [isPickerOpen, applyPicker, closePicker]);

    const handleTypeSelect = (nextBuffer: string) => {
        const target = activeTimeColumn;
        const value = target === 'hour'
            ? String(Math.min(23, Math.max(0, parseInt(nextBuffer, 10)))).padStart(2, '0')
            : String(Math.min(59, Math.max(0, parseInt(nextBuffer, 10)))).padStart(2, '0');

        if (target === 'hour') {
            setPickerTime(`${value}:${pickerTime?.split(':')[1] || '00'}`);
            const btn = hourListRef.current?.querySelector<HTMLButtonElement>(`[data-hour="${value}"]`);
            btn?.scrollIntoView({ block: 'nearest' });
        } else {
            setPickerTime(`${pickerTime?.split(':')[0] || '00'}:${value}`);
            const btn = minuteListRef.current?.querySelector<HTMLButtonElement>(`[data-minute="${value}"]`);
            btn?.scrollIntoView({ block: 'nearest' });
        }
    };

    const onPickerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            applyPicker();
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closePicker();
            return;
        }
        if (e.key === 'Tab' && hasTime) {
            e.preventDefault();
            e.stopPropagation();
            if (!timeTabStarted) {
                setTimeTabStarted(true);
                setActiveTimeColumn('hour');
                const [h = '00'] = pickerTime.split(':');
                const btn = hourListRef.current?.querySelector<HTMLButtonElement>(`[data-hour="${h}"]`);
                btn?.scrollIntoView({ block: 'nearest' });
                return;
            }
            setActiveTimeColumn((prev) => {
                const next = e.shiftKey ? (prev === 'hour' ? 'minute' : 'hour') : (prev === 'hour' ? 'minute' : 'hour');
                const [h = '00', m = '00'] = pickerTime.split(':');
                if (next === 'hour') {
                    const btn = hourListRef.current?.querySelector<HTMLButtonElement>(`[data-hour="${h}"]`);
                    btn?.scrollIntoView({ block: 'nearest' });
                } else {
                    const btn = minuteListRef.current?.querySelector<HTMLButtonElement>(`[data-minute="${m}"]`);
                    btn?.scrollIntoView({ block: 'nearest' });
                }
                return next;
            });
            return;
        }
        if (!/\d/.test(e.key)) return;
        e.preventDefault();
        e.stopPropagation();
        const next = (typeBuffer + e.key).slice(-2);
        setTypeBuffer(next);
        handleTypeSelect(next);
        if (typeTimerRef.current) window.clearTimeout(typeTimerRef.current);
        typeTimerRef.current = window.setTimeout(() => setTypeBuffer(''), 800);
    };

    // Smart NL Parsing Engine
    useEffect(() => {

        if (!title || taskToEdit) return;

        const text = title.toLowerCase();
        let targetDate = new Date();
        let found = false;
        let label = '';

        if (text.includes('hoje') || text.includes('today')) {
            targetDate = setHours(setMinutes(targetDate, 59), 23);
            found = true;
            label = 'Hoje';
        } else if (text.includes('amanhã') || text.includes('tomorrow')) {
            targetDate = addDays(targetDate, 1);
            targetDate = setHours(setMinutes(targetDate, 0), 12);
            found = true;
            label = 'Amanhã';
        } else if (text.includes('próxima semana') || text.includes('next week')) {
            targetDate = addDays(targetDate, 7);
            targetDate = setHours(setMinutes(targetDate, 0), 9);
            found = true;
            label = 'Próxima Semana';
        } else {
            // Weekday detection
            const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
            for (let i = 0; i < weekdays.length; i++) {
                if (text.includes(weekdays[i])) {
                    const currentDay = targetDate.getDay();
                    let daysToAdd = (i - currentDay + 7) % 7;
                    if (daysToAdd === 0) daysToAdd = 7;
                    targetDate = addDays(targetDate, daysToAdd);
                    targetDate = setHours(setMinutes(targetDate, 0), 10);
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
            const formatted = format(targetDate, "yyyy-MM-dd'T'HH:mm");
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
        if (!dueDate) {
            onError("Por favor, defina um prazo de entrega.");
            setLoading(false);
            return;
        }

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
                    finalDueDate = dueDate.length === 16 ? `${dueDate}:00` : dueDate;
                } else {
                    // Force end of day for date-only tasks to ensure they are at the top of the day range
                    const datePart = dueDate.includes('T') ? dueDate.split('T')[0] : dueDate;
                    if (datePart) {
                        finalDueDate = `${datePart}T23:59:59`;
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
                const response = await taskService.update(taskToEdit.id, payload as any);
                if (response?.data) {
                    onTaskUpdated?.(response.data);
                }
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

                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto max-h-[80vh] custom-scrollbar"
                    onKeyDown={(e) => {
                        if (isPickerOpen && (e.key === 'Enter' || e.key === 'Escape')) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            e.currentTarget.requestSubmit();
                        }
                    }}
                >
                    <div className="p-6 space-y-6">
                        {/* Essential Info */}
                        <section className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Título da Tarefa</label>
                                    <div className="flex gap-2">
                                        {title && (
                                            <div />
                                        )}
                                        {suggestion && (
                                            <button
                                                type="button"
                                                tabIndex={-1}
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
                                        onDoubleClick={handleSelectAllOnDoubleClick}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm cursor-default"
                                        placeholder="Ex: Refatorar API amanhã"
                                    />
                                    {title && (
                                        <button
                                            type="button"
                                            tabIndex={-1}
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
                                        <div />
                                    )}
                                </div>
                                <div className="relative group/textarea">
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onDoubleClick={handleSelectAllOnDoubleClick}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[100px] text-sm text-slate-600 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none shadow-sm cursor-default"
                                        placeholder="Descreva os detalhes da implementação..."
                                    />
                                    {description && (
                                        <button
                                            type="button"
                                            tabIndex={-1}
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
                                            type="text"
                                            readOnly
                                            value={formatDisplayDate(dueDate, hasTime)}
                                            placeholder={hasTime ? 'dd/mm/aaaa hh:mm' : 'dd/mm/aaaa'}
                                            onClick={openPicker}
                                            onFocus={openPicker}
                                            onDoubleClick={openPicker}
                                            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans cursor-default"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={openPicker}
                                                onDoubleClick={openPicker}
                                                className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                                                title={hasTime ? "Selecionar data e hora" : "Selecionar data"}
                                            >
                                                <Calendar size={18} />
                                            </button>
                                        </div>

                                        {isPickerOpen && (
                                            <div
                                                ref={pickerRef}
                                                tabIndex={0}
                                                onKeyDown={onPickerKeyDown}
                                                className="absolute right-0 mt-2 z-50 w-64 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 shadow-xl p-3 outline-none"
                                            >
                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-white/10">
                                                    <button
                                                        type="button"
                                                        onClick={setPickerToday}
                                                        className="px-2 py-1 text-[9px] font-bold rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all"
                                                    >
                                                        Hoje
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={setPickerTomorrow}
                                                        className="px-2 py-1 text-[9px] font-bold rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all"
                                                    >
                                                        Amanhã
                                                    </button>
                                                    <div className="ml-auto" />
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data</label>
                                                        <input
                                                            type="date"
                                                            ref={pickerDateInputRef}
                                                            value={pickerDate}
                                                            onChange={(e) => {
                                                                setPickerDate(e.target.value);
                                                                if (hasTime) {
                                                                    setActiveTimeColumn('hour');
                                                                    setTimeTabStarted(true);
                                                                    const [h = '00'] = pickerTime.split(':');
                                                                    const btn = hourListRef.current?.querySelector<HTMLButtonElement>(`[data-hour="${h}"]`);
                                                                    btn?.scrollIntoView({ block: 'nearest' });
                                                                }
                                                            }}
                                                            onDoubleClick={(e) => (e.currentTarget as HTMLInputElement).showPicker()}
                                                            className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-default"
                                                        />
                                                    </div>
                                                    {hasTime && (
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Horário</label>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div onMouseEnter={() => setActiveTimeColumn('hour')}>
                                                                    <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeTimeColumn === 'hour' ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400'}`}>
                                                                        Hora
                                                                    </div>
                                                                    <div ref={hourListRef} className={`max-h-28 overflow-y-auto rounded-lg border bg-white dark:bg-slate-800 ${activeTimeColumn === 'hour' ? 'border-blue-300 ring-2 ring-blue-100 dark:border-blue-700/60 dark:ring-blue-900/30' : 'border-slate-200 dark:border-white/10'}`}>
                                                                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                                                                            <button
                                                                                key={h}
                                                                                type="button"
                                                                                data-hour={h}
                                                                                onClick={() => setPickerTime(`${h}:${pickerTime?.split(':')[1] || '00'}`)}
                                                                                onDoubleClick={() => {
                                                                                    setPickerTime(`${h}:${pickerTime?.split(':')[1] || '00'}`);
                                                                                    applyPicker();
                                                                                }}
                                                                                className={`w-full px-2 py-1 text-left text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 ${pickerTime.startsWith(h) ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' : 'text-slate-600 dark:text-slate-200'}`}
                                                                            >
                                                                                {h}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div onMouseEnter={() => setActiveTimeColumn('minute')}>
                                                                    <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeTimeColumn === 'minute' ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400'}`}>
                                                                        Minuto
                                                                    </div>
                                                                    <div ref={minuteListRef} className={`max-h-28 overflow-y-auto rounded-lg border bg-white dark:bg-slate-800 ${activeTimeColumn === 'minute' ? 'border-blue-300 ring-2 ring-blue-100 dark:border-blue-700/60 dark:ring-blue-900/30' : 'border-slate-200 dark:border-white/10'}`}>
                                                                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                                                                            <button
                                                                                key={m}
                                                                                type="button"
                                                                                data-minute={m}
                                                                                onClick={() => setPickerTime(`${pickerTime?.split(':')[0] || '00'}:${m}`)}
                                                                                onDoubleClick={() => {
                                                                                    setPickerTime(`${pickerTime?.split(':')[0] || '00'}:${m}`);
                                                                                    applyPicker();
                                                                                }}
                                                                                className={`w-full px-2 py-1 text-left text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 ${pickerTime.endsWith(m) ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' : 'text-slate-600 dark:text-slate-200'}`}
                                                                            >
                                                                                {m}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-end gap-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={closePicker}
                                                            className="px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={applyPicker}
                                                            className="px-3 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all"
                                                        >
                                                            Confirmar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                    onDoubleClick={handleSelectAllOnDoubleClick}
                                    placeholder="Adicionar novo passo..."
                                    className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 cursor-default"
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
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Alterações Realizadas</span>
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
                                title="Salvar (Ctrl + Enter)"
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
