from django.urls import path
from . import views as v

app_name = "diary"
urlpatterns = [
    # TODO: add actions with account (i.e. password reset, profile customization)
    path("login", v.auth_login, name="login"),
    path("logout", v.auth_logout, name="logout"),
    path("register", v.auth_register, name="register")
]
