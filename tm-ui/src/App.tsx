import { useState, useEffect } from 'react';

import { KanbanBoard } from './components/KanbanBoard';
import { TaskForm } from './components/TaskForm';
import { ToastContainer } from './components/Toast';
import { Plus, Search, Moon, Sun, LayoutGrid, List } from 'lucide-react';
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
    handleSuccess,
    handleUpdateTask,
    addToast
  } = useKanbanTasks();

  const { theme, toggleTheme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Monitor for reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.reminderEnabled && task.reminderTime && task.status !== 'DONE') {
          const reminderTime = new Date(task.reminderTime);
          const diff = now.getTime() - reminderTime.getTime();

          // If reminder was set for within the last 60 seconds and not notified yet in this session
          // We'll use a session storage to avoid repeating notifications
          const notifiedKey = `notified_${task.id}_${reminderTime.getTime()}`;
          if (diff >= 0 && diff < 60000 && !sessionStorage.getItem(notifiedKey)) {
            addToast('success', `Lembrete: ${task.title}`);
            sessionStorage.setItem(notifiedKey, 'true');
            if (Notification.permission === 'granted') {
              new Notification('Lembrete de Tarefa', { body: task.title });
            }
          }
        }
      });
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [tasks, addToast]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);


  const handleOpenModal = (task?: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(undefined);
  };


  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 py-5 sticky top-0 z-30 shadow-sm transition-all duration-300">

        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-6">
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => {
              setSearch('');
              setViewMode('kanban');
              // Optional: window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Ir para o Início / Atualizar"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-white/5 transition-transform group-hover:scale-105 duration-300">
                <img src="/logo.png" alt="To Do GP Logo" className="w-10 h-10 object-contain rounded-xl" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">To Do <span className="text-blue-600 dark:text-blue-400">GP</span></h1>
            </div>

          </div>

          {/* Search Bar Professionalized */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar inteligência de tarefas..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-slate-700 dark:text-slate-200"
            />

          </div>

          <div className="flex items-center gap-6">
            <SystemClock />

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

            <button
              onClick={() => handleOpenModal()}
              className="group flex items-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 dark:shadow-blue-900/20 active:scale-95 text-sm"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span>Nova Demanda</span>
            </button>

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
            onUpdateTask={handleUpdateTask}
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
      />
    </div>
  );
}

export default App;
