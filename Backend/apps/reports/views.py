from rest_framework.views import APIView
from rest_framework.response import Response

from .services import (
    dashboard_stats,
    top_products,
    warehouse_performance
)


class DashboardAPIView(APIView):
    def get(self, request):
        return Response(dashboard_stats())


class TopProductsAPIView(APIView):
    def get(self, request):
        return Response(top_products())


class WarehousePerformanceAPIView(APIView):
    def get(self, request):
        return Response(warehouse_performance())