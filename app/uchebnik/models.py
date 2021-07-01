"""
Модели для uchebnik
"""
from django.utils.datetime_safe import datetime
from django.db import models
from app.api.models import User


class Exercise(models.Model):
    """
    Модель для Упражнения(Exercise)

    содержит имя, создателя, дату создания,
    таймер, лимит попыток, специальной visible_valid_answers поле,
    tag-имя
    """
    name = models.CharField(max_length=32)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    creation_date = models.DateTimeField(default=datetime.now)
    timer = models.SmallIntegerField(default=360, blank=True)
    # неположительные значение <=> неограниченные кол-во попыток,
    limit_of_tries = models.SmallIntegerField(default=1, blank=True)
    # отвечает за показывание правильных ответов теста после прохождения ШКОЛЬНИКОМ
    visible_valid_answers = models.BooleanField(default=False, blank=True)
    # для выборки
    tag_name = models.CharField(default='', max_length=32)

    def get_exercise(self) -> dict:
        """
        Получение Упражнения(Exercise) в словаре

        :return: Упражнение(Exercise) - словарь
        :rtype: dict
        """
        questions = []
        for _, question in enumerate(self.question_set.all()):
            question_info = {
                'text': question.question_text
            }

            answers = []
            for answer in question.answer_set.all():
                answer_info = {
                        'text': answer.answer_text,
                        'type': answer.answer_type,
                        'valid_input': answer.valid_input,
                        'score': answer.score,
                    }
                answers.append(answer_info)

            question_info['answers'] = answers
            questions.append(question_info)
        data = {
                'title': self.name,
                'tag_name': self.tag_name,
                'time': self.timer,
                'limit_of_tries': self.limit_of_tries,
                'visible_valid_answers': self.visible_valid_answers,
                'questions': questions,
            }
        return data

    def __str__(self):
        """
        STR out
        """
        if self.creator and self.creation_date:
            return self.name
        return '[DATA_CORRUPT]'


class Question(models.Model):
    """
    Модель для Вопросов(Questions)

    содержит текст вопроса, упражнения
    """
    question_text = models.CharField(max_length=128)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)

    def __str__(self):
        """
        STR out
        """
        if self.exercise:
            return self.question_text
        return '[DATA_CORRUPT]'


class Answer(models.Model):
    """
    Модель для Ответов(Answers)

    содержит словарь Types,
    тип ответа, счет,
    текст ответа, спецальное is_valid поле,
    поле ввода ответа, поле ввода правильного ответа,
    вопросы
    """
    TYPES = (
        ('radio', 'Переключатель.'),
        ('checkbox', 'Флажок.'),
        ('textbox', 'Ввод.'),
    )
    answer_type = models.CharField(max_length=16, choices=TYPES)
    #сколько баллов дается если ответ правильный
    score = models.SmallIntegerField(default=1, blank=True, null=True)

    # Задаются.
    answer_text = models.CharField(max_length=32, blank=True)
    is_valid = models.BooleanField(default=False)

    # Вводятся.
    answer_input = models.CharField(max_length=32, blank=True)
    valid_input = models.CharField(max_length=32, default='', blank=True)

    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    def __str__(self):
        """
        STR out
        """
        if self.TYPES is None:
            return '[DATA_CORRUPT]'
        if self.answer_type == 'radio' or self.answer_type == 'checkbox':
            return self.answer_text
        if self.answer_type == 'textbox':
            return self.answer_input
        return '[DATA_CORRUPT]'


class ResultsPassing(models.Model):
    """
    Модель для Результатов(Results)

    exmpl:
    returns
    {
        'question1.id' : [answer1]                   # if answer.type == 'radio'
        or answer.type == 'textbox'
        'question2.id' : [answer1, answer2, answer3] # if answer.type == 'checkbox'
    }

    содержит ученика, упражнение, результат, время на завершение
    """
    pupil = models.ForeignKey(User, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    results = models.JSONField(blank=True, null=True)
    used_time = models.IntegerField(default=0)

    # если тип ответы textbox хранится строка, в остальных случаях порядковый(ые) номер(а) ответов
    # вызывается после того как пользователь прошел опрос
    def add_user_answers(self, results: list) -> None:
        """
        Добавляет пользовательские ответы

        :param results: Списко пользовательских ответов
        :type results: list
        """
        questions = Question.objects.filter(exercise=self.exercise.id)
        pupil_results = {}
        print(results)
        for ind, question in enumerate(questions):
            pupil_results[question.id] = results[question.id]
        self.results = pupil_results

    def get_results(self) -> dict:
        """
        Вывод результатов

        :return: Результаты ответов
        :rtype: dict
        """
        if self.results is None:
            return {'error': '[DATA_CORRUPT]'}
        return self.results
