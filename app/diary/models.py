from django.contrib.auth.models import User
from django.db import models as m

# class User(AbstractUser):
#     ROLES = (
#         ("student", "школьник"),
#         ("teacher", "учитель")
#     )
#     role = m.CharField(max_length=8, default="student", choices=ROLES)
#
#     def __str__(self):
#         return "{}-{}".format(self.username, self.role)
""" CAUSES ERRORS:
auth.User.groups: (fields.E304) Reverse accessor for 'auth.User.groups' clashes with reverse accessor for 'diary.User.groups'.
        HINT: Add or change a related_name argument to the definition for 'auth.User.groups' or 'diary.User.groups'.
auth.User.user_permissions: (fields.E304) Reverse accessor for 'auth.User.user_permissions' clashes with reverse accessor for 'diary.User.user_permissions'.
        HINT: Add or change a related_name argument to the definition for 'auth.User.user_permissions' or 'diary.User.user_permissions'.
diary.User.groups: (fields.E304) Reverse accessor for 'diary.User.groups' clashes with reverse accessor for 'auth.User.groups'.
        HINT: Add or change a related_name argument to the definition for 'diary.User.groups' or 'auth.User.groups'.
diary.User.user_permissions: (fields.E304) Reverse accessor for 'diary.User.user_permissions' clashes with reverse accessor for 'auth.User.user_permissions'.
        HINT: Add or change a related_name argument to the definition for 'diary.User.user_permissions' or 'auth.User.user_permissions'.
"""


class Profile(m.Model):
    ROLES = (
        ("student", "школьник"),
        ("teacher", "учитель")
    )
    role = m.CharField(max_length=8, default="student", choices=ROLES)
    user = m.OneToOneField(User, on_delete=m.CASCADE)

    def __str__(self):
        return "profile-{}-{}".format(self.user.username, self.role)
