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