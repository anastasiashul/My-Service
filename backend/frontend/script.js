// Конфигурация
const API_BASE = 'http://localhost:5000/api';

// Хранилище данных
let tasks = [];
let notes = [];
let currentTaskLabels = [];
let currentEditingId = null;
let currentEditingType = null;

// Инициализация приложения
async function initApp() {
    setupEventListeners();
    await loadTasks();
    await loadNotes();
    showSection('tasks');
}

// ==================== API ФУНКЦИИ ====================

// Загрузка задач
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        if (response.ok) {
            tasks = await response.json();
            renderTasks();
        }
    } catch (error) {
        showNotification('❌ Ошибка загрузки задач', 'error');
        console.error('Ошибка загрузки задач:', error);
    }
}

// Загрузка заметок
async function loadNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes`);
        if (response.ok) {
            notes = await response.json();
            renderNotes();
        }
    } catch (error) {
        showNotification('❌ Ошибка загрузки заметок', 'error');
        console.error('Ошибка загрузки заметок:', error);
    }
}

// Создание задачи
async function createTask() {
    const title = document.getElementById("taskTitleInput").value.trim();
    const description = document.getElementById("taskDescriptionInput").value.trim();
    const priority = document.getElementById("taskPrioritySelect").value;

    if (!title) {
        showNotification('⚠️ Введите название задачи!', 'warning');
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
            showNotification('✅ Задача создана успешно!', 'success');
            await loadTasks();
            clearTaskForm();
        } else {
            throw new Error('Ошибка сервера');
        }
    } catch (error) {
        showNotification('❌ Ошибка создания задачи', 'error');
        console.error('Ошибка:', error);
    }
}

// Создание заметки
async function createNote() {
    const title = document.getElementById("noteTitleInput").value.trim();
    const content = document.getElementById("noteContentInput").value.trim();

    if (!title || !content) {
        showNotification('⚠️ Заполните все поля!', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            showNotification('✅ Заметка создана успешно!', 'success');
            await loadNotes();
            clearNoteForm();
        } else {
            throw new Error('Ошибка сервера');
        }
    } catch (error) {
        showNotification('❌ Ошибка создания заметки', 'error');
        console.error('Ошибка:', error);
    }
}

// Обновление задачи
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
            showNotification('✅ Задача обновлена!', 'success');
            await loadTasks();
        }
    } catch (error) {
        showNotification('❌ Ошибка обновления задачи', 'error');
        console.error('Ошибка обновления:', error);
    }
}

// Удаление задачи
async function deleteTask(id) {
    if (confirm("🗑️ Удалить эту задачу?")) {
        try {
            const response = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification('✅ Задача удалена!', 'success');
                await loadTasks();
            }
        } catch (error) {
            showNotification('❌ Ошибка удаления задачи', 'error');
            console.error('Ошибка удаления:', error);
        }
    }
}

// Обновление заметки
async function updateNote(id, updates) {
    try {
        const response = await fetch(`${API_BASE}/notes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            showNotification('✅ Заметка обновлена!', 'success');
            await loadNotes();
        }
    } catch (error) {
        showNotification('❌ Ошибка обновления заметки', 'error');
        console.error('Ошибка обновления:', error);
    }
}

// Удаление заметки
async function deleteNote(id) {
    if (confirm("🗑️ Удалить эту заметку?")) {
        try {
            const response = await fetch(`${API_BASE}/notes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification('✅ Заметка удалена!', 'success');
                await loadNotes();
            }
        } catch (error) {
            showNotification('❌ Ошибка удаления заметки', 'error');
            console.error('Ошибка удаления:', error);
        }
    }
}

// Переключение выполнения задачи
async function toggleTaskCompletion(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        try {
            await updateTask(id, { completed: !task.completed });
            
            // Автоудаление выполненных задач через 2 секунды
            if (!task.completed) {
                setTimeout(async () => {
                    if (confirm('✅ Задача выполнена! Удалить её?')) {
                        await deleteTask(id);
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Ошибка переключения задачи:', error);
        }
    }
}

// ==================== РАБОТА С МЕТКАМИ ====================

function addLabelToTask() {
    const labelInput = document.getElementById("newLabelInput");
    const colorInput = document.getElementById("labelColorInput");
    const labelName = labelInput.value.trim();
    const labelColor = colorInput.value;

    if (!labelName) {
        showNotification('⚠️ Введите название метки!', 'warning');
        return;
    }

    const label = {
        id: Date.now(),
        name: labelName,
        color: labelColor,
    };

    currentTaskLabels.push(label);
    renderCurrentLabels();
    labelInput.value = "";
}

function addLabel(name, color) {
    const label = {
        id: Date.now(),
        name: name,
        color: color,
    };

    currentTaskLabels.push(label);
    renderCurrentLabels();
}

function removeLabelFromCurrent(labelId) {
    currentTaskLabels = currentTaskLabels.filter(label => label.id !== labelId);
    renderCurrentLabels();
}

function renderCurrentLabels() {
    const preview = document.getElementById("labelsPreview");
    preview.innerHTML = currentTaskLabels.map(label => `
        <div class="label-badge" style="background: ${label.color}">
            ${label.name}
            <span class="remove" onclick="removeLabelFromCurrent(${label.id})">×</span>
        </div>
    `).join("");
}

// ==================== ОТОБРАЖЕНИЕ ДАННЫХ ====================

function renderTasks() {
    const container = document.getElementById("tasksContainer");
    const countElement = document.getElementById("tasksCount");
    
    countElement.textContent = `(${tasks.length})`;

    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">🎉 Отличная работа! Все задачи выполнены.<br><small>Создайте новую задачу чтобы начать</small></div>';
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-main">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTaskCompletion(${task.id})">
                <span class="task-title">${task.title}</span>
                <span class="priority ${task.priority}">${getPriorityText(task.priority)}</span>
            </div>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            ${task.labels && task.labels.length > 0 ? `
                <div class="task-labels">
                    ${task.labels.map(label => `
                        <span class="label" style="background: ${label.color}">${label.name}</span>
                    `).join('')}
                </div>
            ` : ''}
            <div class="task-actions">
                <button onclick="editTask(${task.id})" class="btn btn-edit">✏️ Редактировать</button>
                <button onclick="deleteTask(${task.id})" class="btn btn-delete">🗑️ Удалить</button>
            </div>
            <small class="created-at">Создано: ${task.createdAt}</small>
        </div>
    `).join('');
}

function renderNotes() {
    const container = document.getElementById("notesContainer");
    const countElement = document.getElementById("notesCount");
    
    countElement.textContent = `(${notes.length})`;

    if (notes.length === 0) {
        container.innerHTML = '<div class="empty-state">📝 Заметок пока нет.<br><small>Создайте первую заметку</small></div>';
        return;
    }

    container.innerHTML = notes.map(note => `
        <div class="note-item">
            <h4 class="note-title">${note.title}</h4>
            <p class="note-content">${note.content}</p>
            <div class="note-actions">
                <button onclick="editNote(${note.id})" class="btn btn-edit">✏️ Редактировать</button>
                <button onclick="deleteNote(${note.id})" class="btn btn-delete">🗑️ Удалить</button>
            </div>
            <small class="created-at">Создано: ${note.createdAt}</small>
        </div>
    `).join('');
}

// ==================== РЕДАКТИРОВАНИЕ ====================

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    currentEditingId = id;
    currentEditingType = "task";

    document.getElementById("modalTitle").textContent = "✏️ Редактирование задачи";
    document.getElementById("modalBody").innerHTML = `
        <input type="text" id="editTaskTitle" value="${task.title}" placeholder="Название задачи">
        <textarea id="editTaskDescription" placeholder="Описание задачи">${task.description || ''}</textarea>
        <select id="editTaskPriority">
            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>🔵 Низкий приоритет</option>
            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>🟡 Средний приоритет</option>
            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>🔴 Высокий приоритет</option>
        </select>
        <div class="completed-toggle">
            <label>
                <input type="checkbox" id="editTaskCompleted" ${task.completed ? 'checked' : ''}>
                Задача выполнена
            </label>
        </div>
    `;

    document.getElementById("editModal").style.display = "block";
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentEditingId = id;
    currentEditingType = "note";

    document.getElementById("modalTitle").textContent = "✏️ Редактирование заметки";
    document.getElementById("modalBody").innerHTML = `
        <input type="text" id="editNoteTitle" value="${note.title}" placeholder="Заголовок заметки">
        <textarea id="editNoteContent" placeholder="Текст заметки">${note.content}</textarea>
    `;

    document.getElementById("editModal").style.display = "block";
}

async function saveEdit() {
    if (currentEditingType === "task") {
        const title = document.getElementById("editTaskTitle").value.trim();
        const description = document.getElementById("editTaskDescription").value.trim();
        const priority = document.getElementById("editTaskPriority").value;
        const completed = document.getElementById("editTaskCompleted").checked;

        if (!title) {
            showNotification('⚠️ Введите название задачи!', 'warning');
            return;
        }

        await updateTask(currentEditingId, { title, description, priority, completed });
    } else if (currentEditingType === "note") {
        const title = document.getElementById("editNoteTitle").value.trim();
        const content = document.getElementById("editNoteContent").value.trim();

        if (!title || !content) {
            showNotification('⚠️ Заполните все поля!', 'warning');
            return;
        }

        await updateNote(currentEditingId, { title, content });
    }

    closeEditModal();
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    currentEditingId = null;
    currentEditingType = null;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function getPriorityText(priority) {
    const texts = {
        low: "🔵 Низкий",
        medium: "🟡 Средний",
        high: "🔴 Высокий",
    };
    return texts[priority] || "🟡 Средний";
}

function clearTaskForm() {
    document.getElementById("taskTitleInput").value = "";
    document.getElementById("taskDescriptionInput").value = "";
    document.getElementById("taskPrioritySelect").value = "medium";
    document.getElementById("newLabelInput").value = "";
    currentTaskLabels = [];
    renderCurrentLabels();
}

function clearNoteForm() {
    document.getElementById("noteTitleInput").value = "";
    document.getElementById("noteContentInput").value = "";
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterPriority').value = 'all';
    document.getElementById('filterCompleted').value = 'all';
    showNotification('🔍 Фильтры сброшены', 'info');
}

// ==================== ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ ====================

function setupEventListeners() {
    document.getElementById('showTasksBtn').addEventListener('click', () => showSection('tasks'));
    document.getElementById('showNotesBtn').addEventListener('click', () => showSection('notes'));
    document.getElementById('refreshBtn').addEventListener('click', () => refreshData());
}

function showSection(section) {
    // Обновляем активные кнопки
    document.querySelectorAll('.control-panel .btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показываем/скрываем формы
    document.getElementById('taskFormSection').style.display = section === 'tasks' ? 'block' : 'none';
    document.getElementById('noteFormSection').style.display = section === 'notes' ? 'block' : 'none';

    // Показываем/скрываем списки
    document.getElementById('tasksListSection').style.display = section === 'tasks' ? 'block' : 'none';
    document.getElementById('notesListSection').style.display = section === 'notes' ? 'block' : 'none';

    // Активируем кнопку
    document.getElementById(`show${section.charAt(0).toUpperCase() + section.slice(1)}Btn`).classList.add('active');
}

async function refreshData() {
    showNotification('🔄 Обновление данных...', 'info');
    await loadTasks();
    await loadNotes();
    showNotification('✅ Данные обновлены!', 'success');
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
