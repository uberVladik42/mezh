from django.contrib.auth.models import User
from django.db import models as m

TITLE_LENGTH = 30
CONTENT_LENGTH = 10000


class Exercise(m.Model):
    title = m.CharField(max_length=TITLE_LENGTH)
    creation_date = m.DateTimeField(auto_now=True)
    tries_limit = m.SmallIntegerField(default=1)
    creator = m.ForeignKey(User, on_delete=m.CASCADE)

    def get_exercise(self):
        pass

    def __str__(self):
        return "{}-{}-{}".format(self.title, self.creator, self.creation_date)


class Quest(m.Model):
    content = m.CharField(max_length=CONTENT_LENGTH)
    exercise = m.ForeignKey(Exercise, on_delete=m.CASCADE)

    def __str__(self):
        return "{}".format(self.content, self.exercise.creator, self.exercise.creation_date)


class Answer(m.Model):
    TYPES = (
        # type for file(s)
        ("radio", "один из"),
        ("checkbox", "n из"),
        ("textbox", "ввод")
    )
    content = m.CharField(max_length=CONTENT_LENGTH)
    type = m.CharField(max_length=8, default="radio", choices=TYPES)
    manual_check = m.BooleanField(default=False)
    quest = m.ForeignKey(Quest, on_delete=m.CASCADE)

    def __str__(self):
        return "{}-{}-{}".format(self.quest.content, self.content, self.type)


class Result(m.Model):
    exercise = m.ForeignKey(Exercise, on_delete=m.CASCADE)
    passer = m.ForeignKey(User, on_delete=m.CASCADE)

    def __str__(self):
        return "result-{}".format(str(self.exercise))


class ResultAnswer(m.Model):
    answers = m.ManyToManyField(Answer)
    result = m.ForeignKey(Result, on_delete=m.CASCADE, null=True, blank=True)  # TODO: get rid of null & blank

    # def __str__(self):
    #     return str([str(answer) for answer in self.answers.objects.all()])
