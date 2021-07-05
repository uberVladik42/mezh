from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404

from . import models as m

"""
200 OK
    Standard response for successful HTTP requests. The actual response will depend on the request method used.
    In a GET request, the response will contain an entity corresponding to the requested resource.
    In a POST request, the response will contain an entity describing or containing the result of the action.
400 Bad Request
    The server cannot or will not process the request due to an apparent client error
    (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing).
401 Unauthorized (RFC 7235)
    Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.
    The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource.
    401 semantically means "unauthorised", the user does not have valid authentication credentials for the target resource.
    Note: Some sites incorrectly issue HTTP 401 when an IP address is banned from the website
    (usually the website domain) and that specific address is refused permission to access a website.
405 Method Not Allowed
    A request method is not supported for the requested resource; for example,
    a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.
501 Not Implemented
    The server either does not recognize the request method, or it lacks the ability to fulfil the request.
    Usually this implies future availability (e.g., a new feature of a web-service API).
"""


@login_required
def create_exercise(req):
    if req.method == "POST":
        if req.user.profile.role == "teacher":
            # json_data = json.loads(req.body.decode("utf-8"))
            title = req.POST.get("title")
            creation_date = req.POST.get("creation_date")
            tries_limit = req.POST.get("tries_limit")
            creator = req.user

            if not any(not c.isalnum() for c in title) and tries_limit.isnum():
                m.Exercise.objects.create(
                    title=title,
                    creation_date=creation_date,
                    tries_limit=tries_limit,
                    creator=creator
                )
                # return redirect(куда?)
                return HttpResponse(status=200)
            return HttpResponse(status=400)
        return HttpResponse(status=401)
    elif req.method == "GET":
        return render(req, "textbook/create_exercise.html")
    return HttpResponse(status=405)


@login_required
def edit_exercise(req):
    if req.method == "PUT":
        if req.user.profile.role == "teacher":
            # json_data = json.loads(req.body.decode("utf-8"))
            title = req.POST.get("title")
            creation_date = req.POST.get("creation_date")
            tries_limit = req.POST.get("tries_limit")
            creator = req.user

            if not any(not c.isalnum() for c in title) and tries_limit.isnum():
                exercise = get_object_or_404(m.Exercise, pk=slug)
                exercise.update(
                    title=title,
                    creation_date=creation_date,
                    tries_limit=tries_limit,
                    creator=creator
                )
                # return redirect(куда?)
                return HttpResponse(status=200)
            return HttpResponse(status=400)
        return HttpResponse(status=401)
    elif req.method == "GET":
        context = {
            "exercise": get_object_or_404(m.Exercise, pk=slug)
        }
        return render(req, "textbook/edit_exercise.html", context)
    return HttpResponse(status=405)


@login_required
def get_exercise(req):
    if req.method == "GET":
        exercise = get_object_or_404(m.Exercise, pk=slug)
        return exercise.as_json()
    return HttpResponse(status=405)


@login_required
def get_result(req):
    if req.method == "GET":
        result = get_object_or_404(m.Result, pk=slug)
        return result.as_json()
    return HttpResponse(status=405)
