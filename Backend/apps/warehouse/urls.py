from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseViewSet, RackViewSet

router = DefaultRouter()
router.register('warehouses', WarehouseViewSet)
router.register('racks', RackViewSet)

urlpatterns = [
    path('', include(router.urls)),
]