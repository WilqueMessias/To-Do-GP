import { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskForm } from './components/TaskForm';
import { ToastContainer } from './components/Toast';
import { Plus, BarChart3, Search, Moon, Sun } from 'lucide-react';
import { SystemClock } from './components/SystemClock';
import { AnalyticsPanel } from './components/AnalyticsPanel';
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
    addToast
  } = useKanbanTasks();

  const { theme, toggleTheme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

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
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-5 sticky top-0 z-30 shadow-sm transition-all duration-300">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-700 to-indigo-500 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50">
              <BarChart3 size={22} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">TM <span className="text-blue-600">ANALYTICS</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enterprise Command</p>
            </div>
          </div>

          {/* Search Bar Professionalized */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar inteligência de tarefas..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium"
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

      {/* Analytics Dashboard */}
      <div className="max-w-[1600px] mx-auto w-full px-8 mt-8">
        <AnalyticsPanel tasks={tasks} />
      </div>

      {/* Main Board */}
      <main className="flex-1">
        <KanbanBoard
          onEditTask={handleOpenModal}
          onTasksChange={updateTaskStateLocal}
          tasks={tasks}
        />
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
