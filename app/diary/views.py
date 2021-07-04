import json

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.shortcuts import render, redirect

from app.diary.models import User

"""
200 OK
    Standard response for successful HTTP requests. The actual response will depend on the request method used.
    In a GET request, the response will contain an entity corresponding to the requested resource.
    In a POST request, the response will contain an entity describing or containing the result of the action.
400 Bad Request
    The server cannot or will not process the request due to an apparent client error
    (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing).
405 Method Not Allowed
    A request method is not supported for the requested resource; for example,
    a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.
501 Not Implemented
    The server either does not recognize the request method, or it lacks the ability to fulfil the request.
    Usually this implies future availability (e.g., a new feature of a web-service API).
"""


def auth_login(req):
    if req.method == "POST":
        json_data = json.loads(req.body.decode("utf-8"))
        next_url = json_data["next"]
        # TODO: add data validation
        user = authenticate(
            username=json_data["username"],
            password=json_data["password"]
        )
        if user:
            login(req, user)
            if next_url:
                return redirect(next_url)
            return redirect("/")
        return HttpResponse(status=400)
    elif req.method == "GET":
        return HttpResponse(status=501)
        # return render(req, "diary/login.html")


def auth_logout(req):
    if req.method == "POST":
        if req.user:
            logout(req)
            return redirect("/")
        return HttpResponse(status=400)
    return HttpResponse(status=405)


def auth_register(req):
    if req.method == "POST":
        json_data = json.loads(req.body.decode("utf-8"))
        next_url = json_data["next"]
        # TODO: add data validation
        if json_data["password1"] == json_data["password2"]:
            user = User.objects.create_user(
                json_data["username"],
                json_data["email"],
                json_data["password1"],
            )
            login(req, user)
            if next_url:
                return redirect(next_url)
            return redirect("/")
        return HttpResponse(status=400)
    elif req.method == "GET":
        return HttpResponse(status=501)
        # return render(req, "diary/register.html")


# TODO: add actions with account (i.e. password reset, profile customization)

# sketch; must NOT be used
def set_account_data(req):
    if req.method == "PUT":
        json_data = json.loads(req.body.decode("utf-8"))

        old_password = json_data["old_password"]
        new_password = json_data["new_password"]

        username = json_data["username"]
        email = json_data["email"]

        return HttpResponse(status=501)
    return HttpResponse(status=405)
