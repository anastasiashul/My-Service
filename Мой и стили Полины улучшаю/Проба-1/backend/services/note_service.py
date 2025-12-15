import json
import os
from datetime import datetime
from models.note import Note, NoteStatus
from flask import Flask, jsonify, request
from flask_cors import CORS



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
        current_time = datetime.now().isoformat()
        note = Note(
            id=note_id, 
            title=title, 
            content=content, 
            labels=labels or [],
            created_at=current_time,
            updated_at=current_time
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
    def remove_label_from_all_notes(self, label_name):
    
        for note in self.notes:
            if label_name in note.labels:
                note.labels.remove(label_name)
                note.updated_at = datetime.now().isoformat()
        self._save_notes()