import { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskForm } from './components/TaskForm';
import { Plus, Layout } from 'lucide-react';
import type { Task } from './services/api';

function App() {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Layout size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">TaskManager <span className="text-blue-600">Kanban</span></h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          <span>Nova Tarefa</span>
        </button>
      </header>

      {/* Main Board */}
      <main className="flex-1 bg-[#f8fafc]">
        <KanbanBoard onEditTask={handleOpenModal} />
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
