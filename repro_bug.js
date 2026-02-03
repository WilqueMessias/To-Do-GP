
const axios = require('axios');

async function testDelete() {
    const api = axios.create({ baseURL: 'http://localhost:8080' });

    try {
        console.log('1. Creating Task A...');
        const taskA = await api.post('/tasks', {
            title: 'Task A',
            description: 'Persist this',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: new Date(Date.now() + 86400000).toISOString()
        });

        console.log('2. Creating Task B...');
        const taskB = await api.post('/tasks', {
            title: 'Task B',
            description: 'Delete this',
            status: 'TODO',
            priority: 'LOW',
            dueDate: new Date(Date.now() + 86400000).toISOString()
        });

        const idA = taskA.data.id;
        const idB = taskB.data.id;

        console.log(`3. Deleting Task B (${idB})...`);
        await api.delete(`/tasks/${idB}`);

        console.log('4. Fetching all tasks...');
        const response = await api.get('/tasks');
        const tasks = response.data.content;

        console.log('Current tasks:', tasks.map(t => t.title));

        const foundA = tasks.find(t => t.id === idA);
        const foundB = tasks.find(t => t.id === idB);

        if (foundA && !foundB) {
            console.log('SUCCESS: Task A remains, Task B is gone.');
        } else if (!foundA && !foundB) {
            console.log('BUG DETECTED: All tasks disappeared!');
        } else if (foundB) {
            console.log('BUG DETECTED: Delete had no effect!');
        }
    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

testDelete();
