from datetime import datetime
from typing import List
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

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