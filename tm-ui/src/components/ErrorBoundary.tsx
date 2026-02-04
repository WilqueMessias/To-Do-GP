import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/5 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Ops! Algo deu errado.</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                            Ocorreu um erro inesperado na interface. Mas não se preocupe, seus dados estão seguros no servidor.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            <RefreshCw size={18} />
                            <span>Recarregar Sistema</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
