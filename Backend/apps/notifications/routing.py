from django.urls import re_path
from .consumers import (
    NotificationConsumer,
    DashboardConsumer,
    InventoryConsumer,
    SalesConsumer,
)

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
    re_path(r'ws/dashboard/$', DashboardConsumer.as_asgi()),
    re_path(r'ws/inventory/(?P<warehouse_id>[^/]+)/$', InventoryConsumer.as_asgi()),
    re_path(r'ws/inventory/$', InventoryConsumer.as_asgi()),
    re_path(r'ws/sales/$', SalesConsumer.as_asgi()),
]