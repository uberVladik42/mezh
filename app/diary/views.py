# import json

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.shortcuts import render, redirect

"""
200 OK
    Standard response for successful HTTP requests. The actual response will depend on the request method used.
    In a GET request, the response will contain an entity corresponding to the requested resource.
    In a POST request, the response will contain an entity describing or containing the result of the action.
400 Bad Request
    The server cannot or will not process the request due to an apparent client error
    (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing).
404 Not Found
    The requested resource could not be found but may be available in the future.
    Subsequent requests by the client are permissible.
405 Method Not Allowed
    A request method is not supported for the requested resource; for example,
    a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.
501 Not Implemented
    The server either does not recognize the request method, or it lacks the ability to fulfil the request.
    Usually this implies future availability (e.g., a new feature of a web-service API).
"""


def auth_login(req):
    if req.method == "POST":
        # json_data = json.loads(req.body.decode("utf-8"))
        username = req.POST.get("username")
        password = req.POST.get("password")

        if not any(not c.isalnum() for c in username):
            user = authenticate(
                username=username,
                password=password
            )
            if not user: return HttpResponse(status=404)
            login(req, user)
            return redirect("/")
        return HttpResponse(status=400)
    elif req.method == "GET":
        return render(req, "diary/login.html")
    return HttpResponse(status=405)


def auth_logout(req):
    if req.method == "POST":
        if req.user:
            logout(req)
            return redirect("/")
        return HttpResponse(status=400)
    return HttpResponse(status=405)


def auth_register(req):
    if req.method == "POST":
        # json_data = json.loads(req.body.decode("utf-8"))
        username = req.POST.get("username")
        email = req.POST.get("email")
        password1 = req.POST.get("password1")
        password2 = req.POST.get("password2")

        # TODO: add email validation and check "password1 == password2" for vulnerability
        if not any(not c.isalnum() for c in username) and password1 == password2:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1
            )
            login(req, user)
            return redirect("/")
        return HttpResponse(status=400)
    elif req.method == "GET":
        return render(req, "diary/register.html")
    return HttpResponse(status=405)

# TODO: add actions with account (i.e. password reset, profile customization)
