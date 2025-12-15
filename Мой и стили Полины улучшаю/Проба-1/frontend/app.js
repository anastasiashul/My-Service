class NotesApp {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.notes = [];
        this.labels = [];
        this.init();
    }

    async init() {
        console.log("Starting app...");
        await this.loadLabels();
        await this.loadNotes();
        this.setupEventListeners();
    }

    async loadNotes() {
        try {
            const statusFilter = document.getElementById('filterStatus').value;
            const labelFilter = document.getElementById('filterLabel').value;

            let url = `${this.apiBase}/notes`;
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (labelFilter) params.append('label', labelFilter);

            if (params.toString()) url += '?' + params.toString();

            const response = await fetch(url);
            this.notes = await response.json();
            this.renderNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError('Error loading notes. Make sure server is running on http://localhost:5000');
        }
    }

    
    async checkServerHealth() {
        try {
            const response = await fetch(`${this.apiBase}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.error('Сервер не доступен:', error);
            return false;
        }
    }
    hideLoading() {
        const container = document.getElementById('notesContainer');
        if (this.notes.length === 0) {
            container.innerHTML = '<p class="no-notes">Заметок пока нет. Нажмите "Добавить заметку" чтобы создать первую.</p>';
        }
    }

    setupEventListeners() {
        document.getElementById('addNoteBtn').addEventListener('click', () => this.showAddForm());
        document.getElementById('saveNoteBtn').addEventListener('click', () => this.saveNote());
        document.getElementById('cancelNoteBtn').addEventListener('click', () => this.hideForm());
        document.getElementById('filterStatus').addEventListener('change', () => this.loadNotes());
        document.getElementById('filterLabel').addEventListener('change', () => this.loadNotes());
        document.getElementById('addLabelBtn').addEventListener('click', () => this.showAddLabelForm());
        document.getElementById('saveLabelBtn').addEventListener('click', () => this.saveLabel());
        document.getElementById('cancelLabelBtn').addEventListener('click', () => this.hideLabelForm());
    }
    showAddLabelForm() {
        document.getElementById('labelForm').classList.remove('hidden');
        document.getElementById('labelFormTitle').textContent = 'Новая метка';
        document.getElementById('labelName').value = '';
        document.getElementById('labelColor').value = '#3498db';
        document.getElementById('labelName').focus();
    }
    hideLabelForm() {
        document.getElementById('labelForm').classList.add('hidden');
    }
    async saveLabel() {
        const name = document.getElementById('labelName').value.trim();
        const color = document.getElementById('labelColor').value;

        if (!name) {
            this.showError('Название метки обязательно');
            document.getElementById('labelName').focus();
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/labels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    color: color
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.hideLabelForm();
                await this.loadLabels();  // Перезагружаем список меток
                this.showSuccess('Метка успешно создана!');
            } else {
                this.showError('Ошибка при создании метки: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving label:', error);
            this.showError('Ошибка при создании метки: ' + error.message);
        }
    }
    /*
    async loadNotes() {
        try {
            this.showLoading();
            const statusFilter = document.getElementById('filterStatus').value;
            const labelFilter = document.getElementById('filterLabel').value;

            let url = `${this.apiBase}/notes`;
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (labelFilter) params.append('label', labelFilter);

            if (params.toString()) url += '?' + params.toString();

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            this.notes = await response.json();
            this.renderNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError('Ошибка загрузки заметок: ' + error.message);
        }
    }*/

    async loadLabels() {
        try {
            const response = await fetch(`${this.apiBase}/labels`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            this.labels = await response.json();
            this.renderLabelFilters();
        } catch (error) {
            console.error('Error loading labels:', error);
            this.labels = [];
            this.renderLabelFilters();
        }
    }

    renderNotes() {
        const container = document.getElementById('notesContainer');
        container.innerHTML = '';

        if (this.notes.length === 0) {
            container.innerHTML = '<p class="no-notes">Заметок пока нет</p>';
            return;
        }

        this.notes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            container.appendChild(noteElement);
        });
    }

    createNoteElement(note) {
        const div = document.createElement('div');
        div.className = `note ${note.status}`;
        const { nextStatus, buttonText, buttonClass } = this.getNextStatusInfo(note.status);

        div.innerHTML = `
            <div class="note-header">
                <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                <span class="note-status ${note.status}">${this.getStatusText(note.status)}</span>
            </div>
            <p class="note-content">${this.escapeHtml(note.content)}</p>
            <div class="note-labels">
                ${note.labels && note.labels.length > 0
                ? note.labels.map(label => `<span class="label">${this.escapeHtml(label)}</span>`).join('')
                : '<span class="no-labels">нет меток</span>'
            }
            </div>
            <div class="note-actions">



                <button class="btn btn-edit" onclick="app.showEditForm(${note.id})">
                    ✏️ Редактировать
                </button>


                <button class="btn ${buttonClass}" onclick="app.updateNoteStatus(${note.id}, '${nextStatus}')">
                    ${buttonText}
                </button>
                
                <button class="btn btn-delete" onclick="app.deleteNote(${note.id})">
                    🗑️ Удалить
                </button>
            </div>
            <div class="note-date">
                Создано: ${new Date(note.created_at).toLocaleDateString('ru-RU')}
                ${note.updated_at !== note.created_at ?
                ` | Обновлено: ${new Date(note.updated_at).toLocaleDateString('ru-RU')}` : ''}
            </div>
        `;
        return div;
    }

    getNextStatusInfo(currentStatus) {
        const statusFlow = {
            'active': {
                nextStatus: 'completed',
                buttonText: '✓ Выполнить',
                buttonClass: 'btn-complete'
            },
            'completed': {
                nextStatus: 'archived',
                buttonText: '📁 В архив',
                buttonClass: 'btn-archive'
            },
            'archived': {
                nextStatus: 'active',
                buttonText: '↻ Вернуть в работу',
                buttonClass: 'btn-active'
            }
        };

        return statusFlow[currentStatus] || statusFlow['active'];
    }
    isNoteUpdated(note) {
        if (!note.created_at || !note.updated_at) return false;
        const created = new Date(note.created_at);
        const updated = new Date(note.updated_at);
        return Math.abs(updated - created) > 1000; // Разница больше 1 секунды
    }

    renderLabelFilters() {
        const filterLabel = document.getElementById('filterLabel');
        filterLabel.innerHTML = '<option value="">Все метки</option>';

        this.labels.forEach(label => {
            const option = document.createElement('option');
            option.value = label.name;
            option.textContent = label.name;
            option.style.color = label.color;
            option.setAttribute('data-color', label.color);
            option.setAttribute('data-id', label.id);
            filterLabel.appendChild(option);
        });
        this.addLabelManagement();
    }

    addLabelManagement() {
        const filterContainer = document.querySelector('.filters');

        // Проверяем, не добавили ли уже кнопку
        if (document.getElementById('manageLabelsBtn')) return;

        const manageBtn = document.createElement('button');
        manageBtn.id = 'manageLabelsBtn';
        manageBtn.className = 'btn btn-secondary';
        manageBtn.textContent = 'Управление метками';
        manageBtn.style.marginLeft = '10px';

        manageBtn.addEventListener('click', () => this.showLabelManagement());

        filterContainer.appendChild(manageBtn);
    }

    showLabelManagement() {
        let message = 'Все метки:\n\n';
        this.labels.forEach(label => {
            message += `• ${label.name} [ID: ${label.id}]\n`;
        });

        message += '\nДля удаления метки введите её ID:';
        const labelId = prompt(message);

        if (labelId && !isNaN(labelId)) {
            this.deleteLabel(parseInt(labelId));
        }
    }

    async deleteLabel(labelId) {
        if (!confirm(`Удалить метку с ID ${labelId}? Она также удалится из всех заметок.`)) return;

        try {
            const response = await fetch(`${this.apiBase}/labels/${labelId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadLabels(); // Перезагружаем метки
                await this.loadNotes();  // Перезагружаем заметки (чтобы убрать удаленные метки)
                this.showSuccess('Метка удалена!');
            } else {
                this.showError('Ошибка при удалении метки');
            }
        } catch (error) {
            console.error('Error deleting label:', error);
            this.showError('Ошибка при удалении метки: ' + error.message);
        }
    }


    showAddForm() {
        document.getElementById('noteForm').classList.remove('hidden');
        document.getElementById('formTitle').textContent = 'Новая заметка';
        document.getElementById('noteId').value = '';
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        document.getElementById('noteLabels').value = '';

        // Фокус на заголовок
        document.getElementById('noteTitle').focus();
    }



    async showEditForm(noteId) {
        try {
            console.log(`Opening note ${noteId} for editing...`);

            // 1. Найти заметку в уже загруженном списке
            let note = this.notes.find(n => n.id === noteId);

            if (!note) {
                // Если не нашли в локальном списке, загружаем с сервера
                const response = await fetch(`${this.apiBase}/notes/${noteId}`);
                if (!response.ok) throw new Error('Заметка не найдена');
                note = await response.json();
            }

            // 2. Открыть форму и заполнить данными
            document.getElementById('noteForm').classList.remove('hidden');
            document.getElementById('formTitle').textContent = 'Редактировать заметку';

            // Заполняем поля формы
            document.getElementById('noteId').value = note.id;
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content;
            document.getElementById('noteLabels').value = note.labels ? note.labels.join(', ') : '';

            // 3. Фокус на поле заголовка
            document.getElementById('noteTitle').focus();

        } catch (error) {
            console.error('Error loading note for edit:', error);
            this.showError('Не удалось загрузить заметку для редактирования: ' + error.message);
        }
    }




    hideForm() {
        document.getElementById('noteForm').classList.add('hidden');
    }

    async saveNote() {
        const noteId = document.getElementById('noteId').value;
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const labelsInput = document.getElementById('noteLabels').value.trim();

        // Парсим метки
        const labelNames = labelsInput
            ? labelsInput.split(',').map(l => l.trim()).filter(l => l)
            : [];

        if (!title) {
            this.showError('Заголовок обязателен для заполнения');
            document.getElementById('noteTitle').focus();
            return;
        }

        try {

            const validatedLabels = [];
            for (const labelName of labelNames) {
                try {
                    // Проверяем, существует ли метка
                    const existingLabel = this.labels.find(l => l.name.toLowerCase() === labelName.toLowerCase());

                    if (!existingLabel) {
                        // Создаем новую метку
                        const response = await fetch(`${this.apiBase}/labels`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: labelName })
                        });

                        if (response.ok) {
                            const newLabel = await response.json();
                            validatedLabels.push(newLabel.name);
                            // Обновляем список меток
                            await this.loadLabels();
                        }
                    } else {
                        validatedLabels.push(existingLabel.name);
                    }
                } catch (error) {
                    console.error(`Error processing label "${labelName}":`, error);
                    validatedLabels.push(labelName); // Все равно добавляем
                }
            }
            // Определяем - это редактирование или создание
            const isEdit = noteId !== '';
            const url = isEdit
                ? `${this.apiBase}/notes/${noteId}`  // PUT для редактирования
                : `${this.apiBase}/notes`;           // POST для создания

            const method = isEdit ? 'PUT' : 'POST';

            console.log(`Saving note: isEdit=${isEdit}, id=${noteId}, method=${method}`);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    labels: validatedLabels
                    // Не отправляем status, если не меняем его специально
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.hideForm();
                await this.loadNotes();
                this.showSuccess(isEdit ? 'Заметка успешно обновлена!' : 'Заметка успешно создана!');
            } else {
                this.showError('Ошибка: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving note:', error);
            this.showError('Ошибка: ' + error.message);
        }
    }

    async updateNoteStatus(noteId, status) {
        try {
            const response = await fetch(`${this.apiBase}/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                await this.loadNotes();
                this.showSuccess('Статус заметки обновлен!');
            } else {
                this.showError('Ошибка при обновлении статуса');
            }
        } catch (error) {
            console.error('Error updating note:', error);
            this.showError('Ошибка при обновлении статуса: ' + error.message);
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Удалить эту заметку?')) return;

        try {
            const response = await fetch(`${this.apiBase}/notes/${noteId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadNotes();
                this.showSuccess('Заметка удалена!');
            } else {
                this.showError('Ошибка при удалении заметки');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            this.showError('Ошибка при удалении заметки: ' + error.message);
        }
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Активная',
            'completed': 'Выполнена',
            'archived': 'В архиве'
        };
        return statusMap[status] || status;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showLoading() {
        const container = document.getElementById('notesContainer');
        container.innerHTML = '<p class="no-notes">Загрузка...</p>';
    }

    showError(message) {
        alert('Ошибка: ' + message);
    }

    showSuccess(message) {
        // Можно заменить на красивые уведомления
        console.log('Success:', message);
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NotesApp();
});