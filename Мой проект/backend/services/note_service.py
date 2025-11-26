import json
import os
from datetime import datetime
from models.note import Note

class NoteService:
    def __init__(self, data_file):
        self.data_file = data_file
        self.notes = self._load_notes()
    
    def _load_notes(self):
        """Загрузить заметки из JSON файла"""
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return [Note.from_dict(note) for note in data]
        return []
    
    def _save_notes(self):
        """Сохранить заметки в JSON файл"""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump([note.to_dict() for note in self.notes], f, 
                     indent=2, ensure_ascii=False, default=str)
    
    def get_notes(self, status_filter=None, label_filter=None):
        """Получить заметки с фильтрацией"""
        filtered_notes = self.notes
        
        if status_filter:
            filtered_notes = [n for n in filtered_notes if n.status == status_filter]
        
        if label_filter:
            filtered_notes = [n for n in filtered_notes 
                            if label_filter in n.labels]
        
        return [note.to_dict() for note in filtered_notes]
    
    def create_note(self, title, content, labels=None):
        """Создать новую заметку"""
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
        """Обновить заметку"""
        note = next((n for n in self.notes if n.id == note_id), None)
        if not note:
            return None
        
        for key, value in kwargs.items():
            if value is not None and hasattr(note, key):
                setattr(note, key, value)
        
        note.updated_at = datetime.now()
        self._save_notes()
        return note.to_dict()
    
    def delete_note(self, note_id):
        """Удалить заметку"""
        self.notes = [n for n in self.notes if n.id != note_id]
        self._save_notes()