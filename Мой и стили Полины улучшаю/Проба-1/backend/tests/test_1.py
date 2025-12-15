def test_project_structure():
    """Тест структуры проекта"""
    import os
    
    required_files = [
        '../app.py',
        '../requirements.txt',
        '../models/note.py',
        '../services/note_service.py',
        '../services/label_service.py'
        
        
    ]
    
    for file_path in required_files:
        assert os.path.exists(file_path), f"Файл {file_path} не найден"
    
    print(" Структура проекта корректна")
def test_imports():
    """Тест импортов основных модулей"""
    try:
        from models.note import Note, NoteStatus
        from services.note_service import NoteService
        from services.label_service import LabelService
        print("✅ Импорты работают")
    except ImportError as e:
        raise AssertionError(f"Ошибка импорта: {e}")
