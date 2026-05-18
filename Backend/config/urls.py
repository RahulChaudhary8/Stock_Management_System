
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/warehouse/', include('apps.warehouse.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/sales/', include('apps.sales.urls')),
    path('api/purchases/', include('apps.purchases.urls')),
    path('api/integrations/', include('apps.integrations.urls')),
    path('api/reports/', include('apps.reports.urls')),
]



urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)