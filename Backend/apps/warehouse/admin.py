from django.contrib import admin

from .models import Rack, Warehouse

# Register your models here.
admin.site.register(Warehouse)
admin.site.register(Rack)