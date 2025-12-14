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
                <button class="btn btn-complete" onclick="app.updateNoteStatus(${note.id}, 'completed')">
                    ✓ Выполнено
                </button>
                <button class="btn btn-archive" onclick="app.updateNoteStatus(${note.id}, 'archived')">
                    📁 В архив
                </button>
                <button class="btn btn-delete" onclick="app.deleteNote(${note.id})">
                    🗑️ Удалить
                </button>
            </div>
            <div class="note-date">
                Создано: ${new Date(note.created_at).toLocaleDateString('ru-RU')}
            </div>
        `;
        return div;
    }

    renderLabelFilters() {
        const filterLabel = document.getElementById('filterLabel');
        filterLabel.innerHTML = '<option value="">Все метки</option>';

        this.labels.forEach(label => {
            const option = document.createElement('option');
            option.value = label.name;
            option.textContent = label.name;
            filterLabel.appendChild(option);
        });
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

    hideForm() {
        document.getElementById('noteForm').classList.add('hidden');
    }

    async saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const labelsInput = document.getElementById('noteLabels').value.trim();

        // Парсим метки
        const labels = labelsInput
            ? labelsInput.split(',').map(l => l.trim()).filter(l => l)
            : [];

        if (!title) {
            this.showError('Заголовок обязателен для заполнения');
            document.getElementById('noteTitle').focus();
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    labels: labels
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.hideForm();
                await this.loadNotes();
                this.showSuccess('Заметка успешно создана!');
            } else {
                this.showError('Ошибка при сохранении заметки: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving note:', error);
            this.showError('Ошибка при сохранении заметки: ' + error.message);
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