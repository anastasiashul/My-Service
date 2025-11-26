import json
import os
from models.label import Label

class LabelService:
    def __init__(self, data_file):
        self.data_file = data_file
        self.labels = self._load_labels()
    
    def _load_labels(self):
        """Загрузить метки из JSON файла"""
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return [Label.from_dict(label) for label in data]
        return []
    
    def _save_labels(self):
        """Сохранить метки в JSON файл"""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump([label.to_dict() for label in self.labels], f, 
                     indent=2, ensure_ascii=False)
    
    def get_labels(self):
        """Получить все метки"""
        return [label.to_dict() for label in self.labels]