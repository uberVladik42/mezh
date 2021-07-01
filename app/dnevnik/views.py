"""
Views для dnevnik
"""
import json
import os
import threading
import time
from pathlib import Path
import random
import string

import telebot
from django.contrib.auth.decorators import login_required
from django.contrib.sites.models import Site
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from app.dnevnik.telega import bot
from ivconf.settings import TELEGRAM_ENABLED
from dropbox import Dropbox
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from .models import Lesson, Klass

dbx = Dropbox("35YOZaqu6woAAAAAAAAAAfSp-5agXgdSnb3jdf50-zd3NlNdIVEx73GGA4YquohO")  # instance of Dropbox
LINK_LENGTH = 15
BASE_DIR = os.path.join(Path(__file__).resolve().parent.parent, '..')


def auth_view(req: HttpRequest) -> HttpResponse:
    """
    Отображение страницы аутентификации

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ и страница
    :rtype: HttpResponse
    """
    return render(req, "dnevnik/auth.html")


@login_required
def index_view(req: HttpRequest) -> HttpResponse:
    """
    Отображение главной страницы

    **require login**

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ и страница
    :rtype: HttpResponse
    """
    return render(req, "dnevnik/index.html")


@login_required
def view_personal_account(req: HttpRequest) -> HttpResponse:
    # klass = get_object_or_404(Klass, pk=req.user.id)
    klass = Klass.objects.filter(students=req.user.id)
    print(klass)
    data =\
        {
            'klass': str(klass)
        }
    context = {'data': json.dumps(data)}
    return render(req, "dnevnik/personal_account.html", context)


@csrf_exempt
def telegram(request: HttpRequest) -> HttpResponse:
    """
    Стандартные Telegram процессы

    **csrf exempt**

    :param request: Запрос
    :type request: HttpRequest
    :return: Ответ
    :rtype: HttpResponse
    """
    if request.method == 'POST' and TELEGRAM_ENABLED:
        if request.headers.get('content-type') == 'application/json':
            data = request.body.decode('utf-8')
            update = telebot.types.Update.de_json(data)
            bot.process_new_updates([update])
            return HttpResponse('telegram success')
    return HttpResponse(status=403)


@login_required
def watch_conference(req: HttpRequest) -> HttpResponse:
    """
    Отображение страницы конференции

    **require login**

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ
    :rtype: HttpResponse
    """
    # if req.method == 'POST':
    # TODO: set link and is_teacher
    context = \
        {
            'link': ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(LINK_LENGTH)),
            'conference_name': 'Это я',
            'is_teacher': True
        }
    return render(req, 'dnevnik/watch_conference.html', context)


# return HttpResponse('method not allowed', content_type='plain/text')


def download_conf(length: int, conference_link: str) -> None:
    """
    Скачивание и обрезка записи конференции

    :param length: Размер видео
    :type length: int
    :param conference_link: ID конференции
    :type conference_link: str
    :return: None
    """
    global dbx
    data = str(dbx.files_list_folder(path='/Recordings'))
    if data.find(conference_link) == -1:
        time.sleep(5)
        download_conf(length, conference_link)
    else:
        start_id = data.find(conference_link)
        end_id = data.find('.mp4', start_id)

        # Моделер! Запись сохраняется в формате 'ID конференции (conference_link).mp4'.
        # Загружается она не сразу, спустя +/- 1 минуту, поэтому можно сохранить просто название файла и
        # при заходе на страницу с записями, делать проверку на существование такой записи, чтобы не было ошибки
        # проще всего это сделать через try-except. Если нужна помощь, то тегай в дисе.
        local_file_name = data[start_id:(start_id + LINK_LENGTH)] + '.mp4'
        temp_local_file_name = data[start_id:(start_id + LINK_LENGTH)] + '_temp' + '.mp4'
        dbx.files_download_to_file(os.path.join(BASE_DIR, 'records') + '/' + temp_local_file_name,
                                   '/Recordings/' + data[start_id:(end_id + 4)], rev=None)
        ffmpeg_extract_subclip(os.path.join(BASE_DIR, 'records') + '/' + temp_local_file_name,
                               0, (length // 1000),
                               targetname=os.path.join(BASE_DIR, 'records') + '/' + local_file_name)
        dbx.files_delete('/Recordings/' + data[start_id:(end_id + 4)])
        return


def get_records(all_records: list) -> list:
    """
    Фильтрует и возвращает имена записей в /records папке

    :param all_records: Список всех файлов в /records папке
    :type all_records: list
    :return: Список
    :rtype: List
    """
    answer_records = list()
    for file in all_records:
        if str(file).find('_temp') != -1:
            try:
                os.remove(os.path.join(BASE_DIR, 'records') + '/' + file)
            except Exception:
                print('And I think to myself, what a wonderful world!')
        else:
            if str(file) != 'do_not_delete.txt':
                answer_records.append(file)
    return answer_records


@login_required
def download_conf_page(req: HttpRequest) -> HttpResponse:
    """
    Запускает download_conf() в персональном потоке

    **require login**

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ со статусом
    :rtype: HttpResponse
    """
    if req.is_ajax() and req.method == "GET":
        length = int(req.GET.get("time", 0))
        link = str(req.GET.get("link", ''))
        thread = threading.Thread(target=download_conf, args=(length, link,))
        thread.daemon = True
        thread.start()
    return HttpResponse('OK', content_type='plain/text')


@login_required
def get_records_page(req: HttpRequest) -> HttpResponse:
    """
    Отображает страницу со всеми записями

    **require login**

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ со страницей
    :rtype: HttpResponse
    """
    all_records = get_records(os.listdir(os.path.join(BASE_DIR, 'records')))
    return render(req, 'dnevnik/get_records.html', {'records': all_records})


@login_required
def view_lesson_page(req: HttpRequest) -> HttpResponse:
    """
    Displays page with names of records

    **require login**

    :param req: The request
    :type req: HttpRequest
    :return: HttpResponse
    """
    context = {
        "homework": "Не задано",
        "url": "https://mezh-dxd.ml/watch_conference",
        "conference_id": "dfgshjgfdjg"
    }
    return render(req, 'dnevnik/view_lesson.html', context)


def view_record_page(req: HttpRequest) -> HttpResponse:
    if req.method == "GET":
        file = str(req.GET.get("id", ''))
        return render(req, 'dnevnik/view_record.html', {"file": file})
    return HttpResponse('invalid request', content_type='plain/text')