from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Разрешаем запросы от фронтенда

# Файл для хранения данных
DB_FILE = 'notes.json'

def load_notes():
    """Загружает заметки из JSON файла"""
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_notes(notes):
    """Сохраняет заметки в JSON файл"""
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)

# CRUD операции для заметок

@app.route('/api/notes', methods=['GET'])
def get_notes():
    """Получить все заметки"""
    notes = load_notes()
    return jsonify(notes)

@app.route('/api/notes', methods=['POST'])
def create_note():
    """Создать новую заметку"""
    data = request.json
    
    new_note = {
        'id': len(load_notes()) + 1,
        'title': data.get('title'),
        'description': data.get('description'),
        'status': data.get('status', 'todo'),
        'priority': data.get('priority', 'medium'),
        'labels': data.get('labels', []),
        'due_date': data.get('due_date'),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    notes = load_notes()
    notes.append(new_note)
    save_notes(notes)
    
    return jsonify(new_note), 201

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """Обновить заметку"""
    data = request.json
    notes = load_notes()
    
    for note in notes:
        if note['id'] == note_id:
            note.update({
                'title': data.get('title', note['title']),
                'description': data.get('description', note['description']),
                'status': data.get('status', note['status']),
                'priority': data.get('priority', note['priority']),
                'labels': data.get('labels', note['labels']),
                'due_date': data.get('due_date', note['due_date']),
                'updated_at': datetime.now().isoformat()
            })
            save_notes(notes)
            return jsonify(note)
    
    return jsonify({'error': 'Note not found'}), 404

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Удалить заметку"""
    notes = load_notes()
    notes = [note for note in notes if note['id'] != note_id]
    save_notes(notes)
    return '', 204

# Фильтрация и поиск
@app.route('/api/notes/filter', methods=['GET'])
def filter_notes():
    """Фильтрация заметок по статусу, приоритету, меткам"""
    status = request.args.get('status')
    priority = request.args.get('priority')
    search = request.args.get('search')
    
    notes = load_notes()
    
    if status and status != 'all':
        notes = [note for note in notes if note['status'] == status]
    
    if priority and priority != 'all':
        notes = [note for note in notes if note['priority'] == priority]
    
    if search:
        notes = [note for note in notes if search.lower() in note['title'].lower() or search.lower() in note['description'].lower()]
    
    return jsonify(notes)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
