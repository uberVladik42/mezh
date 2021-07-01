"""
Модели для dnevnik
"""
import json
from django.utils.datetime_safe import datetime
from django.db import models
from app.api.models import User
from app.uchebnik.models import Exercise


class Subject(models.Model):
    """
    Модель для Предмета(Subject)

    содержит учителей, кто преподает этот Предмет, и название Предмета
    """
    # Учитель может преподавать множество предметов.
    # todo: проверить на здравый смысл.
    teachers = models.ManyToManyField(User, blank=True, related_name='teachers')

    subject_name = models.CharField(max_length=32)

    def __str__(self):
        return self.subject_name


class School(models.Model):
    """
    Модель для Школы(School)

    содержит название города и номер школы
    """
    city_name = models.CharField(max_length=32)
    school_num = models.SmallIntegerField(null=True)

    def __str__(self):
        return '{}, Школа №{}'.format(self.city_name, self.school_num)


class Lesson(models.Model):
    """
    Модель для Урока(Lesson)

    содержит предмет, тему урока, ДЗ,
    время начала урока, время конца урока,
    ссылка на конференцию, упражнения для сдачи,
    учитель, кто проводит урок, и дата создания
    """
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    theme = models.CharField(default='Нет темы.', max_length=32)
    homework = models.CharField(default='Нет Д/З.', max_length=32)

    lesson_begin = models.DateTimeField(default=datetime.now)
    lesson_end = models.DateTimeField(default=datetime.now)

    conference_link = models.CharField(max_length=128, blank=True)
    exercises = models.ManyToManyField(Exercise, blank=True)

    # todo: проверить на здравый смысл.
    teacher = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher')
    creation_date = models.DateTimeField(auto_now=True)

    # todo ...
    # presentation_file = models.FileField(blank=True, null=True)
    # conference_record = models.FileField(blank=True, null=True)

    def get_lesson(self) -> dict:
        """
        Возвращает словарь - Урок

        :return: словарь - Урок
        :rtype: dict
        """
        exercises = []
        for exercise in exercises:
            exercises.append(exercise.get_exercise())

        data = {
            'subject': str(self.subject),
            'theme': self.theme,
            'homework': self.homework,
            'start': str(self.lesson_begin),
            'end': str(self.lesson_end),
            'joinlink': 'http://youtube.com',
            'tests': exercises,
        }
        return data

    def __str__(self):
        """
        STR out
        """
        return 'Тема: {}, Предмет: {}'.format(self.theme, self.subject)


# С русского "класс".
class Klass(models.Model):
    """
    Модель для Класса(Class)

    содерджит список учеников,
    объект Школы, символ Класса, год обучения,
    классного руководителя,
    TG ссылку на чат, TG чат-ID,
    уроки
    """
    # У класса много учеников.
    students = models.ManyToManyField(User, related_name='students')

    school = models.ForeignKey(School, on_delete=models.CASCADE)
    genus_sym = models.CharField(max_length=1)
    genus_num = models.SmallIntegerField(null=True)

    # Класс. рук.
    master = models.OneToOneField(User, on_delete=models.CASCADE, related_name='master')

    # ссылка на чат класса
    tg_link = models.URLField(null=True, blank=True)
    tg_chat_id = models.IntegerField(null=True, blank=True)

    # todo: проверить на здравый смысл.
    lessons = models.ManyToManyField(Lesson)

    def get_schedule(self) -> dict:
        """
        Возвращает расписание класса

        :return: Расписание класса в context
        :rtype: dict
        """
        lessons_info = []
        for _, lesson in enumerate(self.lessons.all()):
            lesson_info = lesson.get_lesson()
            lessons_info.append(lesson_info)

        days = {
            'date': '',
            'lessons': lessons_info,
        }
        data = {
            'days': [days]
        }
        context = {'data': data}
        return context

    def __str__(self):
        """
        STR out
        """
        return 'Школа №{}, {}{}'.format(self.school.school_num, self.genus_num, self.genus_sym)


class Mark(models.Model):
    """
    Модель для Оценки(Mark)

    содержит оценку,
    ученика, предмет
    """
    mark = models.SmallIntegerField(null=True)

    # У ученика множество оценок.
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student')
    # Одна оценка за один предмет.
    subject = models.OneToOneField(Subject, on_delete=models.CASCADE)

    def __str__(self):
        """
        STR out
        """
        return 'Mark: {}, {}'.format(str(self.mark), self.subject)
