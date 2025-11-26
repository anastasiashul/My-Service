from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для фронтенда

# Файл для хранения данных
DATA_FILE = 'data.json'

def load_data():
    """Загрузка данных из файла"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {'tasks': [], 'notes': []}

def save_data(data):
    """Сохранение данных в файл"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# API для задач
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    data = load_data()
    return jsonify(data['tasks'])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = load_data()
    task_data = request.json
    
    task = {
        'id': datetime.now().timestamp(),
        'title': task_data.get('title'),
        'description': task_data.get('description', ''),
        'priority': task_data.get('priority', 'medium'),
        'labels': task_data.get('labels', []),
        'completed': False,
        'createdAt': datetime.now().strftime('%d.%m.%Y %H:%M:%S')
    }
    
    data['tasks'].append(task)
    save_data(data)
    return jsonify(task), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = load_data()
    task_data = request.json
    
    for task in data['tasks']:
        if str(task['id']) == task_id:
            task.update({
                'title': task_data.get('title', task['title']),
                'description': task_data.get('description', task['description']),
                'priority': task_data.get('priority', task['priority']),
                'completed': task_data.get('completed', task['completed'])
            })
            save_data(data)
            return jsonify(task)
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    data = load_data()
    data['tasks'] = [task for task in data['tasks'] if str(task['id']) != task_id]
    save_data(data)
    return jsonify({'message': 'Task deleted'})

# API для заметок
@app.route('/api/notes', methods=['GET'])
def get_notes():
    data = load_data()
    return jsonify(data['notes'])

@app.route('/api/notes', methods=['POST'])
def create_note():
    data = load_data()
    note_data = request.json
    
    note = {
        'id': datetime.now().timestamp(),
        'title': note_data.get('title'),
        'content': note_data.get('content'),
        'createdAt': datetime.now().strftime('%d.%m.%Y %H:%M:%S')
    }
    
    data['notes'].append(note)
    save_data(data)
    return jsonify(note), 201

@app.route('/api/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    data = load_data()
    note_data = request.json
    
    for note in data['notes']:
        if str(note['id']) == note_id:
            note.update({
                'title': note_data.get('title', note['title']),
                'content': note_data.get('content', note['content'])
            })
            save_data(data)
            return jsonify(note)
    
    return jsonify({'error': 'Note not found'}), 404

@app.route('/api/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    data = load_data()
    data['notes'] = [note for note in data['notes'] if str(note['id']) != note_id]
    save_data(data)
    return jsonify({'message': 'Note deleted'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
