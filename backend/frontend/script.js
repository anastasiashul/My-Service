const API_BASE = 'http://localhost:5000/api';

// Загрузка задач с сервера
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
    }
}

// Загрузка заметок с сервера
async function loadNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes`);
        notes = await response.json();
        renderNotes();
    } catch (error) {
        console.error('Ошибка загрузки заметок:', error);
    }
}

// Создание задачи через API
async function create_task() {
    const title = document.getElementById("taskTitleInput").value.trim();
    const description = document.getElementById("taskDescriptionInput").value.trim();
    const priority = document.getElementById("taskPrioritySelect").value;

    if (!title) {
        alert("Введите название задачи!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                priority,
                labels: currentTaskLabels
            })
        });

        if (response.ok) {
            await loadTasks();
            clearTaskForm();
        } else {
            alert('Ошибка создания задачи');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка создания задачи');
    }
}

// Обновление и удаление задач через API
async function updateTask(id, updates) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Ошибка обновления:', error);
    }
}

async function deleteTask(id) {
    if (confirm("Удалить эту задачу?")) {
        try {
            const response = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadTasks();
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    }
}

// Аналогично для заметок...
