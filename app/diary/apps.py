from django.apps import AppConfig


class DiaryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.diary'

    def ready(self):
        from . import signals
