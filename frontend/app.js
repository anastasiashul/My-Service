const API_BASE = 'http://localhost:5000/api';

// Вместо работы с localStorage - AJAX запросы к бэкенду

async function create_task() {
    const title = document.getElementById('taskTitleInput').value;
    const description = document.getElementById('taskDescriptionInput').value;
    const priority = document.getElementById('taskPrioritySelect').value;
    const dueDate = document.getElementById('dueDate').value;
    
    const taskData = {
        title: title,
        description: description,
        priority: priority,
        status: 'active',
        labels: currentLabels, // массив меток
        due_date: dueDate
    };
    
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            const newTask = await response.json();
            loadTasks(); // Перезагружаем список
            clearForm();
        }
    } catch (error) {
        console.error('Ошибка создания задачи:', error);
    }
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/notes`);
        const tasks = await response.json();
        
        const container = document.getElementById('tasksContainer');
        container.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            container.appendChild(taskElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${API_BASE}/notes/${taskId}`, {
            method: 'DELETE'
        });
        loadTasks(); // Обновляем список
    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
}
