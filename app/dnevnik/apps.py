"""
Конфигурация приложения(App)
"""
from django.apps import AppConfig


class DnevnikConfig(AppConfig):
    """
    Класс конфигурации
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.dnevnik'
