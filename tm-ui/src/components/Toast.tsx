import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const Toast: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onRemove]);

    return (
        <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-in slide-in-from-right duration-300
            ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}
        `}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="flex-1 font-medium text-sm">{toast.message}</span>
            <button onClick={onRemove} className="opacity-80 hover:opacity-100">
                <X size={16} />
            </button>
        </div>
    );
};
