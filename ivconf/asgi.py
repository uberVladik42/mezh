"""
ASGI config for ivconf project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from app.dnevnik import telega
from ivconf.settings import TELEGRAM_ENABLED

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ivconf.settings')

application = get_asgi_application()
if TELEGRAM_ENABLED:
    telega.init()
