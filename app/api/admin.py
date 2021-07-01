"""
Регистрация модели в django registration panel
Модели:
    User,
"""
from django.contrib import admin
from .models import User

admin.site.register(User)
