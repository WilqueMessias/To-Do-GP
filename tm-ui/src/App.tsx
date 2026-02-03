import { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskForm } from './components/TaskForm';
import { Plus, Layout } from 'lucide-react';
import type { Task } from './services/api';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const handleSuccess = () => {
    // We'll need to expose a refresh method in KanbanBoard
    // For now, let's just reload the page or use a better state management
    window.location.reload();
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col gap-6 sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Layout size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">TaskManager <span className="text-blue-600">Kanban</span></h1>
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
        <KanbanBoard onEditTask={handleOpenModal} onTasksChange={setTasks} />
      </main>

      {/* Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

export default App;
