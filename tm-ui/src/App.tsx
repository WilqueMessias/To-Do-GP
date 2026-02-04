import { useState, useEffect, useCallback } from 'react';

import { KanbanBoard } from './components/KanbanBoard';
import { TaskForm } from './components/TaskForm';
import { ToastContainer } from './components/Toast';
import { Plus, Search, Moon, Sun, LayoutGrid, List, ArrowUpDown, Github, Linkedin, Instagram, HelpCircle, X, Sparkles } from 'lucide-react';
import { SystemClock } from './components/SystemClock';
import { TaskListView } from './components/TaskListView';


import { useKanbanTasks } from './hooks/useKanbanTasks';
import { useTheme } from './hooks/useTheme';
import type { Task } from './services/api';

function App() {
  const {
    tasks,
    search,
    setSearch,
    toasts,
    removeToast,
    updateTaskStateLocal,
    removeTaskLocal,
    handleSuccess,
    handleUpdateTask,
    addToast,
    sortConfig,
    setSortConfig,
    refresh: loadTasks
  } = useKanbanTasks();

  const { theme, toggleTheme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Audio Alarm Logic (Web Audio API for zero dependencies)
  const playAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Slide to A4

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio context failed (likely user interaction required):', e);
    }
  };

  // Tab Flashing State
  const [isAlerting, setIsAlerting] = useState(false);

  useEffect(() => {
    if (!isAlerting) {
      document.title = 'To Do GP';
      return;
    }

    const interval = setInterval(() => {
      document.title = document.title === 'To Do GP' ? '⚠️ ALERTA DE TAREFA ⚠️' : 'To Do GP';
    }, 1000);

    const stopAlert = () => {
      setIsAlerting(false);
      window.removeEventListener('focus', stopAlert);
    };
    window.addEventListener('focus', stopAlert);

    return () => clearInterval(interval);
  }, [isAlerting]);

  // Monitor for reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.reminderEnabled && task.reminderTime && task.status !== 'DONE') {
          const reminderTime = new Date(task.reminderTime);
          const diff = now.getTime() - reminderTime.getTime();

          const notifiedKey = `notified_${task.id}_${reminderTime.getTime()}`;
          if (diff >= 0 && diff < 60000 && !sessionStorage.getItem(notifiedKey)) {
            addToast('success', `Lembrete GP: ${task.title}`);
            sessionStorage.setItem(notifiedKey, 'true');

            // Trigger Alarm Actions
            playAlarmSound();
            setIsAlerting(true);

            if (Notification.permission === 'granted') {
              new Notification('To Do GP - Inteligência', {
                body: `Hora de agir: ${task.title}`,
                icon: '/logo.png'
              });
            }
          }
        }
      });
    }, 15000); // Check every 15s for better precision
    return () => clearInterval(interval);
  }, [tasks, addToast]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);


  const handleOpenModal = useCallback((task?: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTaskToEdit(undefined);
  }, []);

  useEffect(() => {
    const handleGlobalShortcuts = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingField = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

      // Modal management shortcuts
      if (event.key === 'Escape') {
        if (isHelpOpen) {
          setIsHelpOpen(false);
          return;
        }
        if (isModalOpen) {
          handleCloseModal();
          return;
        }
      }

      if (isTypingField) return;

      // Global shortcuts (when not typing)
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleOpenModal();
      } else if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        setIsHelpOpen(prev => !prev);
      } else if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Pesquisar tarefas..."]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [handleOpenModal, isModalOpen, isHelpOpen, handleCloseModal]);


  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 md:px-8 py-4 md:py-5 sticky top-0 z-30 shadow-sm transition-all duration-300">

        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex w-full md:w-auto justify-between items-center">
            <div
              className="flex items-center gap-3 md:gap-4 cursor-pointer group"
              onClick={() => {
                setSearch('');
                setViewMode('kanban');
              }}
              title="Ir para o Início / Atualizar"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white dark:bg-slate-800 p-1 md:p-1.5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-white/5 transition-transform group-hover:scale-105 duration-300">
                  <img src="/logo.png" alt="To Do GP Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">To Do <span className="text-blue-600 dark:text-blue-400">GP</span></h1>
              </div>
            </div>

            {/* Mobile Actions (Visible only on mobile next to logo) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button
                title="Ajuda e atalhos"
                onClick={() => setIsHelpOpen(true)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95"
              >
                <HelpCircle size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar Professionalized */}
          <div className="w-full md:flex-1 md:max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar tarefas..."
              className="w-full pl-12 pr-4 py-2.5 md:py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-slate-700 dark:text-slate-200"
            />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <SystemClock />

            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              title="Atalhos e Ajuda (?)"
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              <HelpCircle size={18} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              title={theme === 'light' ? 'Ativar Modo Dark' : 'Ativar Modo Light'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <LayoutGrid size={16} />
                <span>Quadro</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <List size={16} />
                <span>Lista</span>
              </button>
            </div>

            <div className="relative group/sort">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs">
                <ArrowUpDown size={16} className="text-blue-500" />
                <span>Classificar</span>
              </button>

              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all z-50 p-2 transform origin-top scale-95 group-hover/sort:scale-100">
                {[
                  { id: 'dueDate', label: 'Data de Entrega' },
                  { id: 'priority', label: 'Prioridade' },
                  { id: 'title', label: 'Nome (A-Z)' },
                  { id: 'status', label: 'Status' },
                  { id: 'important', label: 'Importância' },
                  { id: 'none', label: 'Padrão' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortConfig(prev => ({
                      key: opt.id,
                      direction: prev.key === opt.id && prev.direction === 'asc' ? 'desc' : 'asc'
                    }))}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-black transition-all flex justify-between items-center ${sortConfig.key === opt.id ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    {opt.label}
                    {sortConfig.key === opt.id && (
                      <span className="text-[10px] opacity-60">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="group flex items-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 dark:shadow-blue-900/20 active:scale-95 text-sm"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span>Nova Demanda</span>
            </button>
          </div>

          {/* Secondary Mobile Actions (View Mode & Sorting) */}
          <div className="flex md:hidden w-full items-center justify-between gap-2 pb-1">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/5 flex-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <LayoutGrid size={14} />
                <span>Quadro</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <List size={14} />
                <span>Lista</span>
              </button>
            </div>

            <div className="relative group/sort-mob">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:bg-slate-200 transition-all font-bold text-xs"
                onClick={() => {
                  // Direct toggle on mobile might be better, but for now we'll rely on the existing pattern if possible
                  // or just let the user use the dropdown if it works on touch.
                }}
              >
                <ArrowUpDown size={14} className="text-blue-500" />
              </button>
              {/* Note: Sort dropdown might need better mobile handling, but let's see if generic hover/active works first */}
            </div>
          </div>
        </div>
      </header>


      {/* Fluid Dynamic Background (Modern Landing Page Style) */}
      <div className="fluid-bg">
        <div className="fluid-blob blob-1"></div>
        <div className="fluid-blob blob-2"></div>
        <div className="fluid-blob blob-3"></div>

        {/* Subtle Overlays for Texture */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-transparent opacity-80 pointer-events-none"></div>
      </div>



      {/* Main Board */}
      <main className="flex-1">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            onEditTask={handleOpenModal}
            onTasksChange={updateTaskStateLocal}
            onRemoveTasks={removeTaskLocal}
            onUpdateTask={handleUpdateTask}
            onRefresh={loadTasks}
            tasks={tasks}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onEditTask={handleOpenModal}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </main>


      {/* Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={(action, id) => handleSuccess(action, id)}
        onError={(msg) => addToast('error', msg)}
        taskToEdit={taskToEdit}
        onTaskUpdated={(updated) => {
          updateTaskStateLocal((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }}
      />
      {isHelpOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-2xl animate-modal-pop backdrop-blur-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-600">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Centro de Ajuda</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Atalhos de produtividade</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 custom-scrollbar max-h-[70vh] overflow-y-auto">
              {/* Categoria: Navegação Global */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Navegação & Geral</h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Nova demanda inteligente</span>
                    <kbd className="group-hover:scale-110 transition-transform">N</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Focar na pesquisa global</span>
                    <kbd className="group-hover:scale-110 transition-transform">S</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Abrir painel de ajuda</span>
                    <kbd className="group-hover:scale-110 transition-transform">?</kbd>
                  </div>
                </div>
              </section>

              {/* Categoria: No Formulário */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Dentro do Formulário</h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 group hover:border-amber-500/30 transition-all">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Salvar alterações instantaneamente</span>
                    <div className="flex gap-1">
                      <kbd className="group-hover:scale-110 transition-transform text-[10px]">Ctrl</kbd>
                      <span className="text-slate-400">+</span>
                      <kbd className="group-hover:scale-110 transition-transform text-[10px]">Enter</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 group hover:border-amber-500/30 transition-all">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Fechar qualquer janela</span>
                    <kbd className="group-hover:scale-110 transition-transform text-[10px]">Esc</kbd>
                  </div>
                </div>
              </section>

              {/* Dica Extra */}
              <div className="p-4 rounded-2xl bg-blue-600 text-white flex items-center gap-4 shadow-lg shadow-blue-500/20">
                <div className="p-2 rounded-xl bg-white/20">
                  <Sparkles size={18} />
                </div>
                <p className="text-xs font-semibold leading-relaxed">
                  Dica: No título da tarefa, digite "hoje" ou "amanhã" para definir prazos automaticamente!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Footer - Minimalist & Discreet */}
      <footer className="w-full py-4 px-4 md:px-8 bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm border-t border-slate-200/30 dark:border-white/5 mt-auto transition-all">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 opacity-60 hover:opacity-100 transition-opacity duration-500">

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400">© 2026 To Do GP</span>
            <span className="h-3 w-[1px] bg-slate-300 dark:bg-white/10"></span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Developed by <span className="text-slate-700 dark:text-slate-200">Wilque Messias</span>
            </span>
            <div className="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-white/10 pl-4">
              <a href="https://github.com/WilqueMessias" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Github size={14} />
              </a>
              <a href="https://br.linkedin.com/in/wilquemessias" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Linkedin size={14} />
              </a>
              <a href="https://www.instagram.com/wilquemessias/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors">
                <Instagram size={14} />
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

export default App;
