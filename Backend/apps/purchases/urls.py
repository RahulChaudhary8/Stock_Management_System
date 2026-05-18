from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, SupplierPaymentViewSet

router = DefaultRouter()
router.register('orders', PurchaseOrderViewSet)
router.register('payments', SupplierPaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]