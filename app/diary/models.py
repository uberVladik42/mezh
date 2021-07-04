from django.contrib.auth.models import AbstractUser
from django.db import models as m


class User(AbstractUser):
    ROLES = (
        ("student", "школьник"),
        ("teacher", "учитель")
    )
    role = m.CharField(max_length=8, default="student", choices=ROLES)

    def __str__(self):
        return "{}-{}".format(self.username, self.role)
