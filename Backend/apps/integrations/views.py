from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import *
from .serializers import *
from .services import log_api_call


class IntegrationConfigViewSet(viewsets.ModelViewSet):
    queryset = IntegrationConfig.objects.all()
    serializer_class = IntegrationConfigSerializer

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        integration = self.get_object()

        response_data = {
            "status": "success",
            "message": "Connection successful"
        }

        log_api_call(
            integration,
            "test_connection",
            {},
            response_data,
            200
        )

        return Response(response_data)


class APILogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = APILog.objects.all()
    serializer_class = APILogSerializer