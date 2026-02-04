import React, { useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger'
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeys = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                onConfirm();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [isOpen, onConfirm, onClose]);

    if (!isOpen) return null;

    const getVariantClasses = () => {
        switch (variant) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning': return 'bg-amber-500 hover:bg-amber-600 text-white';
            case 'info': return 'bg-blue-600 hover:bg-blue-700 text-white';
            default: return 'bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-white/10">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                </div>
                <div className="p-4 flex gap-2 justify-end bg-slate-50/50 dark:bg-slate-800/30">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${getVariantClasses()}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
