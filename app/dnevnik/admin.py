"""
Регистрация модели в django registration panel
Модели:
    Subject,
    School,
    Lesson,
    Klass,
    Mark,
"""
from django.contrib import admin
from .models import Subject, School, Lesson, Klass, Mark

admin.site.register(Subject)
admin.site.register(School)
admin.site.register(Lesson)
admin.site.register(Klass)
admin.site.register(Mark)
