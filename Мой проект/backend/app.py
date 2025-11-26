from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

class NoteStatus:
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class Note:
    def __init__(self, id, title, content, status=NoteStatus.ACTIVE, labels=None, created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.content = content
        self.status = status
        self.labels = labels or []
        # Если created_at - строка, оставляем как есть, иначе создаем новую дату
        if isinstance(created_at, str):
            self.created_at = created_at
        else:
            self.created_at = created_at or datetime.now().isoformat()
        
        if isinstance(updated_at, str):
            self.updated_at = updated_at
        else:
            self.updated_at = updated_at or datetime.now().isoformat()
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'status': self.status,
            'labels': self.labels,
            'created_at': self.created_at,  # Убираем .isoformat()
            'updated_at': self.updated_at   # Убираем .isoformat()
        }

class NoteService:
    def __init__(self, data_file):
        self.data_file = data_file
        self.notes = self._load_notes()
    
    def _load_notes(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    notes = []
                    for note_data in data:
                        # Создаем заметку из данных JSON
                        note = Note(
                            id=note_data['id'],
                            title=note_data['title'],
                            content=note_data['content'],
                            status=note_data.get('status', NoteStatus.ACTIVE),
                            labels=note_data.get('labels', []),
                            created_at=note_data.get('created_at'),
                            updated_at=note_data.get('updated_at')
                        )
                        notes.append(note)
                    return notes
            except Exception as e:
                print(f"Error loading notes: {e}")
                return []
        return []
    
    def _save_notes(self):
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump([note.to_dict() for note in self.notes], f, indent=2, ensure_ascii=False)
    
    def get_notes(self, status_filter=None, label_filter=None):
        filtered_notes = self.notes
        if status_filter:
            filtered_notes = [n for n in filtered_notes if n.status == status_filter]
        if label_filter:
            filtered_notes = [n for n in filtered_notes if label_filter in n.labels]
        return [note.to_dict() for note in filtered_notes]
    
    def create_note(self, title, content, labels=None):
        note_id = max([n.id for n in self.notes], default=0) + 1
        note = Note(
            id=note_id, 
            title=title, 
            content=content, 
            labels=labels or []
        )
        self.notes.append(note)
        self._save_notes()
        return note.to_dict()
    
    def update_note(self, note_id, **kwargs):
        note = next((n for n in self.notes if n.id == note_id), None)
        if not note:
            return None
        
        for key, value in kwargs.items():
            if value is not None and hasattr(note, key):
                setattr(note, key, value)
        
        # Обновляем updated_at
        note.updated_at = datetime.now().isoformat()
        self._save_notes()
        return note.to_dict()
    
    def delete_note(self, note_id):
        self.notes = [n for n in self.notes if n.id != note_id]
        self._save_notes()

class LabelService:
    def __init__(self, data_file):
        self.data_file = data_file
        self.labels = self._load_labels()
    
    def _load_labels(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        default_labels = [
            {"id": 1, "name": "work", "color": "#3498db"},
            {"id": 2, "name": "personal", "color": "#e74c3c"},
            {"id": 3, "name": "urgent", "color": "#f39c12"}
        ]
        self.labels = default_labels
        self._save_labels()
        return default_labels
    
    def _save_labels(self):
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(self.labels, f, indent=2, ensure_ascii=False)
    
    def get_labels(self):
        return self.labels

note_service = NoteService('data/notes.json')
label_service = LabelService('data/labels.json')

@app.route('/api/notes', methods=['GET'])
def get_notes():
    status_filter = request.args.get('status')
    label_filter = request.args.get('label')
    notes = note_service.get_notes(status_filter=status_filter, label_filter=label_filter)
    return jsonify(notes)

@app.route('/api/notes', methods=['POST'])
def create_note():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    note = note_service.create_note(
        title=data.get('title'),
        content=data.get('content', ''),
        labels=data.get('labels', [])
    )
    return jsonify(note), 201

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    data = request.get_json()
    note = note_service.update_note(
        note_id=note_id,
        title=data.get('title'),
        content=data.get('content'),
        status=data.get('status'),
        labels=data.get('labels')
    )
    if note:
        return jsonify(note)
    return jsonify({'error': 'Note not found'}), 404

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    note_service.delete_note(note_id)
    return '', 204

@app.route('/api/labels', methods=['GET'])
def get_labels():
    labels = label_service.get_labels()
    return jsonify(labels)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    print("Server starting on http://localhost:5000")
    print("Open frontend/index.html in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)