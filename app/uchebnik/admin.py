"""
Регистрация модели в django registration panel
Модели:
    Exercise,
    Question,
    Answer,
    ResultsPassing,
"""
from django.contrib import admin
from .models import Exercise, Question, Answer, ResultsPassing

admin.site.register(Exercise)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(ResultsPassing)
