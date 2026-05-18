from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IntegrationConfigViewSet, APILogViewSet

router = DefaultRouter()
router.register('configs', IntegrationConfigViewSet)
router.register('logs', APILogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]