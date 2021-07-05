from django.contrib import admin
from . import models as m

admin.site.register(m.Exercise)
admin.site.register(m.Quest)
admin.site.register(m.Answer)
admin.site.register(m.Result)
admin.site.register(m.ResultAnswer)
