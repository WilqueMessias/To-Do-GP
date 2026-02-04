import React from 'react';
import type { Task } from '../services/api';
import { X, RotateCcw, Trash2, Clock, Calendar } from 'lucide-react';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: Task[];
    onRestore: (task: Task) => void;
    onHardDelete: (task: Task) => void;
    onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    history,
    onRestore,
    onHardDelete,
    onClearHistory
}) => {
    const [sortOrder, setSortOrder] = React.useState<'desc' | 'asc'>('desc');

    if (!isOpen) return null;

    const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.completedAt || 0).getTime();
        const dateB = new Date(b.completedAt || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden m-4 transform transition-all scale-100">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                        <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Clock size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Histórico</h2>
                        <span className="text-sm font-normal text-gray-500 ml-2">({history.length})</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-800 dark:text-gray-400 flex items-center gap-2 text-xs font-medium"
                            title="Mudar ordem"
                        >
                            <Calendar size={16} />
                            {sortOrder === 'desc' ? 'Mais Recentes' : 'Mais Antigos'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500 flex flex-col items-center gap-3">
                            <Trash2 size={48} className="opacity-20" />
                            <p>O histórico está vazios.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedHistory.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate flex items-center gap-2">
                                            {task.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Concluída em: {new Date(task.completedAt || Date.now()).toLocaleDateString()}
                                            {' '}às {new Date(task.completedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onRestore(task)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            title="Restaurar tarefa"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                        <button
                                            onClick={() => onHardDelete(task)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                            title="Excluir Permanentemente"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {history.length > 0 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
                        <button
                            onClick={onClearHistory}
                            className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Limpar Histórico
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
