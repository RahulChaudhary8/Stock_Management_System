from django.urls import path
from .views import *

urlpatterns = [
    path('dashboard/', DashboardAPIView.as_view()),
    path('top-products/', TopProductsAPIView.as_view()),
    path('warehouse-performance/', WarehousePerformanceAPIView.as_view()),
]