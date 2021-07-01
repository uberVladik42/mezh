"""
Набор используемых в API URL
"""
from django.urls import path
from . import views

app_name = 'api'
urlpatterns = [
    path('auth_login', views.auth_login, name='login'),
    path('auth_logout', views.auth_logout, name='logout'),
    path('auth_register', views.auth_register, name='register'),
    path('create_exercise', views.create_exercise, name='create_exercise'),
    path('view_exercise/<int:exercise_id>', views.view_exercise, name='view_exercise'),
    path('redact_exercise/<int:exercise_id>', views.edit_exercise, name='redact_exercise'),
    path('get_exercise_data/<int:exercise_id>', views.get_exercise_data, name='get_exercise_data'),
    path('get_schedule', views.get_schedule, name='get_schedule'),
    path('set_account_data', views.set_account_data, name='set_account_data'),
]
