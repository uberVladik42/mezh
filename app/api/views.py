"""
Views для API
"""
import json
from typing import Optional
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import HttpResponse, get_object_or_404
from django.http import HttpRequest, JsonResponse
# from django.db import models
from app.api.models import User
from app.dnevnik.models import Klass, School
from app.uchebnik.models import Exercise, Question, Answer, ResultsPassing


def auth_login(req: HttpRequest) -> HttpResponse:
    """
    Аутентификация, logIN

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ со статусом
    :rtype: HttpResponse
    """
    if req.method == "POST":
        json_data = json.loads(req.body.decode("utf-8"))
        user = authenticate(
            username=json_data['username'],
            password=json_data['password'],
        )
        if user:
            login(req, user)
            return HttpResponse('success', content_type='plain/text')
        return HttpResponse('auth error', content_type='plain/text')
    return HttpResponse('method not allowed', content_type='plain/text')


def auth_logout(req: HttpRequest) -> HttpResponse:
    """
    Аутентификация, logOUT

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ со статусом
    :rtype: HttpResponse
    """
    if req.method == "POST":
        if req.user:
            logout(req)
            return HttpResponse('success', content_type='plain/text')
        return HttpResponse('user not logged in', content_type='plain/text')
    return HttpResponse('method not allowed', content_type='plain/text')


def auth_register(req: HttpRequest) -> HttpResponse:
    """
    Аутентификация, регистрация

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ со статусом
    :rtype: HttpResponse
    """
    if req.method == "POST":
        json_data = json.loads(req.body.decode("utf-8"))
        if json_data['password1'] == json_data['password2']:
            user = User.objects.create_user(
                json_data['username'],
                json_data['email'],
                json_data['password1'],
            )
            login(req, user)
            return HttpResponse('success')
        return HttpResponse('passwords doesn\'t match')
    return HttpResponse('method not allowed', content_type='plain/text')


def set_account_data(req: HttpRequest) -> HttpResponse:
    if req.method == 'POST':

        data = json.loads(req.body.decode("utf-8"))

        old_password = data['old_password']
        new_password = data['new_password']

        req.user.username = data['username']
        req.user.email = data['email']

        if old_password == req.user.password:
            req.user.password = new_password

        return HttpResponse('success')
    return JsonResponse('method not allowed')


def get_exercise_data(req: HttpRequest, exercise_id: int) -> HttpResponse:
    """
    Получение объекта Упражнение(Exercise) для дальнейших действий

    :param req: Запрос
    :type req: HttpRequest
    :param exercise_id: ID Упражнения(Exercise)
    :type exercise_id: int
    :return: Ответ с объектом или статусом
    :rtype: HttpResponse
    """
    if req.method == 'POST':
        exercise = get_object_or_404(Exercise, pk=exercise_id)
        return JsonResponse(exercise.get_exercise())
    return JsonResponse('method not allowed')


def view_exercise(req: HttpRequest, exercise_id: int) -> HttpResponse:
    """
    Отображение Упражнения(Exercise)

    exmpl:
        data =
        {
            'time': <<время прохождения>>
            'answers':
                [
                    ['текст, если тип ответа textbox'],
                    [0, 1, 2]      # порядковый(ые) номер(а) выбранных ответов
                ]
        }

    :param req: Запрос
    :type req: HttpRequest
    :param exercise_id: ID Упражнения(Exercise)
    :type exercise_id: int
    :return: Ответ со статусом или NONE(Отображение)
    :rtype: Optional[HttpResponse]
    """
    if req.method == 'POST':
        data = json.loads(req.body.decode("utf-8"))
        exercise = get_object_or_404(Exercise, pk=exercise_id)
        questions = Question.objects.filter(exercise=exercise_id)
        results = {}
        for question_ind, question in enumerate(questions):
            results[question.id] = []
            for answer in Answer.objects.filter(question=question.id):
                if answer.answer_type == 'textbox':
                    answer.answer_input = data['answers'][question_ind]
                    answer.save()

            results[question.id] = data['answers'][question_ind]

        pupil_results = ResultsPassing\
            (
                exercise=exercise,
                pupil=req.user,
                used_time=data['time']
            )
        pupil_results.add_user_answers(results)
        pupil_results.used_time = data['time']
        pupil_results.save()
        return HttpResponse('success')
    return HttpResponse('method not allowed', content_type='plain/text')


def fill_exercise(data: dict, exercise: Exercise) -> Optional[str]:
    """
    Заполнение Упражнения(Exercise) существующими данными.

    :param data: JSON-данные
    :type data: dict
    :param exercise: Объект Упражнения(Exercise) для заполнения
    :type exercise: Exercise
    :return: AnswerTypeError в случае ошибки
    :rtype: Optional[str]
    """
    questions_info = data['questions_info']
    for ind, question_info in enumerate(questions_info):
        question = Question.objects.create(
            question_text=question_info['question_text'],
            exercise=exercise,
        )
        question.save()
        answers_info = data['answers_info'][ind]
        answer = None
        for answer_info in answers_info:
            if answer_info['answer_type'] == 'textbox':
                answer = Answer.objects.create(
                    answer_type=answer_info['answer_type'],
                    answer_text=answer_info['answer_text'],
                    valid_input=answer_info['valid_input'],
                    question=question,
                    score=1
                )
            elif answer_info['answer_type'] == 'radio' or answer_info['answer_type'] == 'checkbox':
                answer = Answer.objects.create(
                    answer_type=answer_info['answer_type'],
                    answer_text=answer_info['answer_text'],
                    is_valid=answer_info['is_valid'],
                    question=question,
                    score=1
                )
            else:
                return 'AnswerTypeError'
            answer.save()
    return None


def create_exercise(req: HttpRequest) -> HttpResponse:
    """
    Создание и заполнение объекта Упражнение(Exercise)

    :param req: Запос
    :type req: HttpRequest
    :return: Ответ со статусом
    :rtype: HttpResponse
    """
    if req.method == "POST":
        json_data = json.loads(req.body.decode("utf-8"))
        # todo: какая-то валидация.
        exercise = Exercise.objects.create(
            name=json_data['exercise_name'],
            creator=req.user,
            timer=json_data['time'],
            limit_of_tries=json_data['limit_of_tries'],
            visible_valid_answers=json_data['visible_valid_answers'],
            tag_name=json_data['tag_name'],
        )
        exercise.save()

        if fill_exercise(json_data, exercise) == 'AnswerTypeError':
            return HttpResponse('unknown answer type', content_type='plain/text')
        return HttpResponse('success', content_type='plain/text')
    return HttpResponse('method not allowed', content_type='plain/text')


def edit_exercise(req: HttpRequest, exercise_id: int) -> HttpResponse:
    """
    Изменение существующего Упражнения(Exercise)

    :param req: Запрос
    :type req: HttpRequest
    :param exercise_id: ID Упражнения(Exercise)
    :type exercise_id: int
    :return: Ответ со статусом
    :rtype: HttpResponse
    """
    if req.method == 'POST':
        json_data = json.loads(req.body.decode("utf-8"))
        exercise = get_object_or_404(Exercise, pk=exercise_id)
        exercise.name = json_data['exercise_name']
        exercise.creator = req.user
        exercise.timer = json_data['time']
        exercise.limit_of_tries = json_data['limit_of_tries']
        exercise.visible_valid_answers = json_data['visible_valid_answers']
        exercise.tag_name = json_data['tag_name']
        exercise.save()

        Question.objects.filter(exercise=exercise_id).delete()

        if fill_exercise(json_data, exercise) == 'AnswerTypeError':
            return HttpResponse('unknown answer type', content_type='plain/text')
        return HttpResponse('success', content_type='plain/text')
    return HttpResponse('method not allowed', content_type='plain/text')


def get_schedule(req: HttpRequest) -> HttpResponse:
    """
    Получение расписания

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ со статусом или данными
    :rtype: HttpResponse
    """
    if req.method == "GET":
        klasses = Klass.objects.all()
        for klass in klasses:
            if req.user in klass.students.all():
                res = klass.get_schedule()
                return JsonResponse(res['data'])
        return HttpResponse('student not found', content_type='plain/text')
    return JsonResponse('method not allowed')
