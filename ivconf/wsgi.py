"""
WSGI config for ivconf project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from app.dnevnik import telega
from ivconf.settings import TELEGRAM_ENABLED

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ivconf.settings')

application = get_wsgi_application()
if TELEGRAM_ENABLED:
    telega.init()
