"""
Views для uchebnik
"""
from math import floor
import json

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, HttpResponse
from django.http import HttpRequest
from app.uchebnik.models import Exercise, Question, ResultsPassing, Answer


@login_required
def create_exercise(req: HttpRequest) -> HttpResponse:
    """
    Отображает страницу создания Упражнений

    **login require**

    :param req: Запрос
    :type req: HttpRequest
    :return: Ответ и страницу
    :rtype: HttpResponse
    """
    if req.user.role == 'teacher':
        return render(req, "uchebnik/redact_exercise.html")
    return HttpResponse('only teachers are allowed to view this page', content_type='plain/text')


@login_required
def edit_exercise(req: HttpRequest, exercise_id: int) -> HttpResponse:
    """
    Отображает страницу редактирования Упражнения

    **login require**

    :param req: Запрос
    :type req: HttpRequest
    :param exercise_id: ID Упражнения
    :type exercise_id: int
    :return: Ответ и/или страницу
    :rtype: HttpResponse
    """
    if req.user.role == 'teacher':
        exercise = get_object_or_404(Exercise, pk=exercise_id)
        if len(ResultsPassing.objects.filter(exercise=exercise_id)) != 0:
            return HttpResponse('someone has completed this test, it can not be changed anymore',
                                content_type='plain/text')
        return render(req, "uchebnik/redact_exercise.html")
    return HttpResponse('only teachers are allowed to view this page', content_type='plain/text')


@login_required
def view_exercise(req: HttpRequest, exercise_id: int) -> HttpResponse:
    """
    Отображает Упражнение

    **login require**

    :param req: Запрос
    :type req: HttpRequest
    :param exercise_id: ID Упражнения
    :type exercise_id: int
    :return: Ответ и/или страницу
    :rtype: HttpResponse
    """
    exercise = get_object_or_404(Exercise, pk=exercise_id)
    pupil_results = ResultsPassing.objects.filter(pupil=req.user, exercise=exercise_id)

    if 0 < exercise.limit_of_tries < len(pupil_results):
        return HttpResponse('limit of tries was exceeded', content_type='plain/text')
    return render(req, "uchebnik/view_exercise.html")


# осторожно: нестабильный sheet of code
# {
def normalize_results(results: dict) -> dict:
    """
    Меняет тип ключей словаря со str на int

    :param results: Ответы ученика
    :type results: dict
    :return: переделанный словарь ответов ученика
    :rtype: dict
    """
    new_results = {}
    for question_id, answer in results.items():
        new_results[int(question_id)] = answer

    return new_results


def check_answers(pupil_results: dict, exercise_id: int) -> dict:
    """
    Проверяет корректные ответы

    :param pupil_results: Ответы ученика
    :type pupil_results: dict
    :param exercise_id: ID Упражнения
    :type exercise_id: int
    :return: Словарь с ответами, счетом, оценкой и вопросами
    :rtype: dict
    """
    results = normalize_results(pupil_results)
    exercise = get_object_or_404(Exercise, pk=exercise_id)
    questions = Question.objects.filter(exercise=exercise_id)
    pupil_answers = []
    scores = []
    total_score, max_total_score = 0, 0
    total_right_answered_questions = 0
    total_questions = len(questions)

    for question in questions:
        score, max_score = 0, 0
        text_answers = Answer.objects.filter(question=question.id, answer_type='textbox')
        if len(text_answers) != 0:
            for text_answer in text_answers:
                if text_answer.answer_input == text_answer.valid_input:
                    score += text_answer.score
                    total_right_answered_questions += 1
                max_score += text_answer.score
                pupil_answers.append\
                    ({
                        'input': text_answer.answer_input,
                        'correct': text_answer.valid_input if exercise.visible_valid_answers else None,
                    })

        else:
            valid_answers, chosen_answers = [], []
            for answer_ind, answer in enumerate(Answer.objects.filter(question=question.id)):
                chosen_answers = results[question.id]
                for chosen_answer in chosen_answers:
                    if chosen_answer == answer_ind and answer.is_valid:
                        score += answer.score
                        total_right_answered_questions += 1

                if answer.is_valid:
                    valid_answers.append(answer_ind)
                    max_score += answer.score

            # порядковые номера выбранных школьником и правильных ответов
            pupil_answers.append\
                ({
                    'chosen': chosen_answers,
                    'is_correct': valid_answers if exercise.visible_valid_answers else None,
                })

        scores.append\
            ({
                'pupil_score': score,
                'max_score': max_score
            })
        total_score += score
        max_total_score += max_score

    valid_answers_percent = (total_score / max_total_score) * 100
    info = \
        {
            'progress': valid_answers_percent,  # процент правильных ответов
            'scores': scores,  # массив баллов по каждому вопросу
            'total_score': total_score,
            'max_total_score': max_total_score,
            # вместо <<5>> n-бальная шкала, хранимая в Mark
            'mark': floor(valid_answers_percent / (100 / 5)),
            'right_answered_questions': total_right_answered_questions,
            'questions_cnt': total_questions,
            'answers': pupil_answers,
        }

    return info


@login_required
def view_pupil_results(req: HttpRequest, results_id: int) -> HttpResponse:
    """
    Отображает результат ученика

    **login require**

    :param req: Запрос
    :type req: HttpRequest
    :param results_id: ID Результатов
    :type results_id: int
    :return: Ответ и страницу
    :rtype: HttpResponse
    """
    pupil_results = get_object_or_404(ResultsPassing, pk=results_id)
    exercise = get_object_or_404(Exercise, pk=pupil_results.exercise.id)
    stats = check_answers(pupil_results.get_results(), pupil_results.exercise.id)

    data = \
        {
            'wasted_time': pupil_results.used_time,
            'mark': stats['mark'],
            'progress': stats['progress'],
            'scores': stats['scores'],
            'right_answered_questions': stats['right_answered_questions'],
            'questions_cnt': stats['questions_cnt'],
            'total_score': stats['total_score'],
            'max_total_score': stats['max_total_score'],
            'marked_answers': stats['answers'],
            'exercise_data': exercise.get_exercise(),
        }
    context = {'data': json.dumps(data)}
    return render(req, 'uchebnik/pupil_results.html', context)


# Результаты всех учеников, только для учителя
@login_required
def view_exercise_statistics(req: HttpRequest, exercise_id: int) -> HttpResponse:
    """
    Отображает Статистику по Упражнению

    exmpl:
        data =
            {
                'title': exercise.name,
                'time': exercise.timer,
                'tested_pupils':
                [
                     'name': tested_pupil['name'],
                     'tries':
                     [
                        'wasted_time': pupil_passings.used_time,
                        'mark': pupil_stats['mark'],
                        'progress': pupil_stats['progress']
                     ]
                ]
            }

    **login require**


    :param req: Запрос
    :type req: HttpRequest
    :param exercise_id: ID Упражнения
    :type exercise_id: int
    :return: Ответ со статусом или страницей
    :rtype: HttpResponse
    """
    if req.user.role == 'teacher':
        exercise = get_object_or_404(Exercise, pk=exercise_id)
        pupils_passings = ResultsPassing.objects.filter(exercise=exercise_id)
        tested_pupils_info = []
        tested_pupils = []
        tested_pupils_names = set([pupil_passings.pupil.username for pupil_passings in pupils_passings])
        for tested_pupil_name in tested_pupils_names:
            tested_pupils.append\
                ({
                    'name': tested_pupil_name,
                    'tries': [pupil_passings for pupil_passings in pupils_passings
                              if pupil_passings.pupil.username == tested_pupil_name],
                })

        for ind, tested_pupil in enumerate(tested_pupils):
            tested_pupils_info.append\
                ({
                    'name': tested_pupil['name'],
                    'tries': []
                })
            for pupil_passings in tested_pupil['tries']:
                pupil_stats = check_answers(pupil_passings.results, exercise_id)
                tested_pupils_info[ind]['tries'].append\
                    ({
                        'wasted_time': pupil_passings.used_time,
                        'mark': pupil_stats['mark'],
                        'progress': pupil_stats['progress'],
                        'id': pupil_passings.id
                    })

        data = \
            {
                'title': exercise.name,
                'time': exercise.timer,
                'creator': exercise.creator.username,
                'creation_date': str(exercise.creation_date),
                'limit_of_tries': exercise.limit_of_tries,
                'tested_pupils': tested_pupils_info
            }

        context = {'data': json.dumps(data)}
        return render(req, 'uchebnik/exercise_statistics.html', context)
    return HttpResponse('only teachers are allowed to view this page', content_type='plain/text')
