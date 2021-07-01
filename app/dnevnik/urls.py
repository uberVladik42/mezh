"""
Набор используемых в dnevnik URL
"""
from django.urls import path
from . import views

app_name = 'dnevnik'
urlpatterns = [
    path('auth', views.auth_view, name='auth'),
    path('', views.index_view, name='index'),
    path('telegram/', views.telegram),
    path('watch_conference/', views.watch_conference, name='watch_conference'),
    path('download_conf/', views.download_conf_page, name='download_conf'),
    path('get_records/', views.get_records_page, name='get_records'),
    path('view_lesson/', views.view_lesson_page, name='view_lesson'),
    path('view_record/', views.view_record_page, name='view_record'),
    path('view_personal_account', views.view_personal_account, name='view_personal_account'),
]
