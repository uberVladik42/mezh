#!/usr/bin/env bash

cd /pfs102_institutum_virtual/ || exit 1
python manage.py migrate
python manage.py collectstatic --noinput
daphne -b 0.0.0.0 -p 8085 --access-log /var/log/pfs102_institutum_virtual/daphne_access.log ivconf.asgi:application
