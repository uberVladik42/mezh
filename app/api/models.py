"""
Модели для API
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Модель для Базового Пользователя(Base User), по-умолчанию, "student"
    """
    ROLES = (
        ('student', 'школьник'),
        ('teacher', 'учитель'),
    )
    role = models.CharField(max_length=16, default='student', choices=ROLES)

    def __str__(self):
        return '{}-{}'.format(self.username, self.role)
