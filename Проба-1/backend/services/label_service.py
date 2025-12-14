import json
import os
#from models.label import Label
from datetime import datetime
from models.note import Note, NoteStatus
from flask import Flask, jsonify, request
from flask_cors import CORS

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
            {
                "id": 1,
                "name": "работа",
                "color": "#3498db"
            },
            {
                "id": 2,
                "name": "личное",
                "color": "#e74c3c"
            },
            {
                "id": 3,
                "name": "срочно",
                "color": "#f39c12"
            },
            {
                "id": 4,
                "name": "идеи",
                "color": "#9b59b6"
            }


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

    def create_label(self, name, color=None):
        name = name.strip()
    
        # Проверяем, нет ли уже метки с таким именем
        existing_label = next((label for label in self.labels if label['name'].lower() == name.lower()), None)
        if existing_label:
            return existing_label  # Возвращаем существующую метку
    
        # Генерируем новый ID
        label_id = max([label['id'] for label in self.labels], default=0) + 1
    
        # Автоматически выбираем цвет из палитры
        colors = ["#3498db", "#e74c3c", "#f39c12", "#9b59b6", 
                 "#1abc9c", "#34495e", "#e67e22", "#16a085"]
        color = colors[(label_id - 1) % len(colors)]
    
        new_label = {
            "id": label_id,
            "name": name,
            "color": color
        }
    
        self.labels.append(new_label)
        self._save_labels()
        return new_label
        
    
    def delete_label(self, label_id):
        """Удалить метку"""
        self.labels = [label for label in self.labels if label['id'] != label_id]
        self._save_labels()
        return True