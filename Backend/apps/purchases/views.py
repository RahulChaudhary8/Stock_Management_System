from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import *
from .serializers import *
from .services import receive_stock


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        purchase = self.get_object()

        if purchase.status != 'PENDING':
            return Response({"error": "Already processed"})

        receive_stock(purchase)

        purchase.status = 'RECEIVED'
        purchase.save()

        return Response({"message": "Stock received"})


class SupplierPaymentViewSet(viewsets.ModelViewSet):
    queryset = SupplierPayment.objects.all()
    serializer_class = SupplierPaymentSerializer