from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
from services.note_service import NoteService
from services.label_service import LabelService
from pathlib import Path
app = Flask(__name__)
CORS(app)




BACKEND_DIR = Path(__file__).parent.absolute()
DATA_DIR = BACKEND_DIR / "data"
NOTES_FILE = DATA_DIR / "notes.json"
LABELS_FILE = DATA_DIR / "labels.json"
DATA_DIR.mkdir(exist_ok=True)
note_service = NoteService(NOTES_FILE)
label_service = LabelService(LABELS_FILE)

@app.route('/api/notes', methods=['GET'])
def get_notes():
    status_filter = request.args.get('status')
    label_filter = request.args.get('label')
    notes = note_service.get_notes(status_filter=status_filter, label_filter=label_filter)
    return jsonify(notes)


@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    # Получаем все заметки
    all_notes = note_service.get_notes()
    # Ищем нужную заметку по ID
    note = next((n for n in all_notes if n['id'] == note_id), None)
    
    if note:
        return jsonify(note)
    return jsonify({'error': 'Note not found'}), 404



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