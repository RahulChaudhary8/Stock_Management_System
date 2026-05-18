from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('categories', CategoryViewSet)
router.register('brands', BrandViewSet)
router.register('suppliers', SupplierViewSet)
router.register('variants', ProductVariantViewSet)
router.register('images', ProductImageViewSet)
router.register("reviews", ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]