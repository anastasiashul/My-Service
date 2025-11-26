class Label:
    def __init__(self, id: int, name: str, color: str = "#3498db"):
        self.id = id
        self.name = name
        self.color = color
    
    def to_dict(self):
        """Преобразовать в словарь для JSON"""
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color
        }
    
    @classmethod
    def from_dict(cls, data):
        """Создать из словаря"""
        return cls(
            id=data['id'],
            name=data['name'],
            color=data.get('color', '#3498db')
        )