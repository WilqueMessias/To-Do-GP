import { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskForm } from './components/TaskForm';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { Plus, Layout, Search } from 'lucide-react';
import type { Task } from './services/api';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenModal = (task?: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(undefined);
  };

  const handleSuccess = (action: 'create' | 'update' | 'delete') => {
    const messages = {
      create: 'Tarefa criada com sucesso!',
      update: 'Tarefa atualizada com sucesso!',
      delete: 'Tarefa removida com sucesso!'
    };
    addToast('success', messages[action]);
    // Refresh will happen via the state update from KanbanBoard or we can force reload
    setTimeout(() => window.location.reload(), 800);
  };

  // Calcular estatísticas
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    doing: tasks.filter(t => t.status === 'DOING').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    highPriority: tasks.filter(t => t.priority === 'HIGH').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col gap-6 sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Layout size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">TaskManager <span className="text-blue-600">Kanban</span></h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-6 mr-6 border-r pr-6 border-slate-200">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total</p>
                <p className="text-lg font-bold text-slate-700">{stats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-blue-400">Fazendo</p>
                <p className="text-lg font-bold text-blue-600">{stats.doing}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-green-400">Concluído</p>
                <p className="text-lg font-bold text-green-600">{stats.done}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-red-400">Crítico</p>
                <p className="text-lg font-bold text-red-600">{stats.highPriority}</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <Plus size={20} />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1">
        <KanbanBoard
          onEditTask={handleOpenModal}
          onTasksChange={setTasks}
          tasks={filteredTasks}
        />
      </main>

      {/* Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        onError={(msg) => addToast('error', msg)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

export default App;
