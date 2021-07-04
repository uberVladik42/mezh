from django.db import models as m

from app.diary.models import User

TITLE_LENGTH = 30
CONTENT_LENGTH = 10000


class Exercise(m.Model):
    title = m.CharField(max_length=TITLE_LENGTH)
    creation_date = m.DateTimeField(auto_now=True)
    tries_limit = m.SmallIntegerField(default=1)
    view_answers = m.BooleanField(default=False)
    creator = m.ForeignKey(User, on_delete=m.CASCADE)

    def get_exercise(self):
        pass

    def __str__(self):
        return "{}-{}-{}".format(self.title, self.creator, self.creation_date)


class Quest(m.Model):
    content = m.CharField(max_length=CONTENT_LENGTH)
    exercise = m.ForeignKey(Exercise, on_delete=m.CASCADE)

    def __str__(self):
        return "{}".format(self.content, self.exercise.creactor, self.exercise.creation_date)


class Answer(m.Model):
    TYPES = (
        ("file", "файл"),
        ("radio", "один из"),
        ("checkbox", "n из"),
        ("textbox", "ввод")
    )
    content = m.CharField(max_length=CONTENT_LENGTH)
    type = m.CharField(max_length=16, default="radio", choices=TYPES)
    manual_check = m.BooleanField(default=False)
    quest = m.ForeignKey(Quest, on_delete=m.CASCADE)

    def __str__(self):
        return "{}-{}-{}".format(self.quest.content, self.content, self.type)


class Result(m.Model):
    exercise = m.OneToOneField(Exercise, on_delete=m.CASCADE)


class ResultAnswer(m.Model):
    answer = m.OneToOneField(Answer)
