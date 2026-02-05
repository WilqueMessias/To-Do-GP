import type { Task } from './api';

export const exportToCSV = (tasks: Task[]) => {

    const rows = tasks.map(t => {
        const subtasksStr = t.subtasks?.map(s => `${s.title} [${s.completed ? 'X' : ' '}]`).join(' | ') || '';

        return [
            t.id,
            `"${t.title.replace(/"/g, '""')}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            `"${t.dueDate ? new Date(t.dueDate).toLocaleString('pt-BR') : ''}"`,
            `"${t.createdAt ? new Date(t.createdAt).toLocaleString('pt-BR') : ''}"`,
            `"${subtasksStr.replace(/"/g, '""')}"`,
            t.important ? 'Sim' : 'Não'
        ];
    });

    const finalHeaders = ['ID', 'Título', 'Descrição', 'Status', 'Prioridade', 'Data de Entrega', 'Criada em', 'Passos', 'Importante'];
    const csvContent = [finalHeaders.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_tarefas_gp_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportTasks = (tasks: Task[]) => {
    // For now, CSV is the primary format. PDF would typically require a library like jspdf.
    exportToCSV(tasks);
};
