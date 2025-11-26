from datetime import datetime
from typing import List

class NoteStatus:
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class Note:
    def __init__(self, id: int, title: str, content: str, 
                 status: str = NoteStatus.ACTIVE, 
                 labels: List[str] = None,
                 created_at: datetime = None,
                 updated_at: datetime = None):
        self.id = id
        self.title = title
        self.content = content
        self.status = status
        self.labels = labels or []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
    
    def to_dict(self):
        """Преобразовать в словарь для JSON"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'status': self.status,
            'labels': self.labels,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        """Создать из словаря"""
        return cls(
            id=data['id'],
            title=data['title'],
            content=data['content'],
            status=data.get('status', NoteStatus.ACTIVE),
            labels=data.get('labels', []),
            created_at=datetime.fromisoformat(data['created_at']),
            updated_at=datetime.fromisoformat(data['updated_at'])
        )