"""
Конфигурация приложения(App)
"""
from django.apps import AppConfig


class UchebnikConfig(AppConfig):
    """
    Класс конфигурации
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.uchebnik'
