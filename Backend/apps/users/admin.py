from django.contrib import admin
from .models import AuditLog, User

admin.site.register(User)
admin.site.register(AuditLog)