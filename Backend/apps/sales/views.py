from django.http import FileResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import *
from .serializers import *
from .services import deduct_stock, restore_stock
from .utils import generate_invoice_pdf


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()

        if order.status != 'PENDING':
            return Response({"error": "Already processed"})

        try:
            deduct_stock(order)
            order.status = 'CONFIRMED'
            order.save()
            return Response({"message": "Order confirmed"})
        except Exception as e:
            return Response({"error": str(e)})


    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status != 'CONFIRMED':
            return Response({"error": "Only confirmed orders can be cancelled"})

        restore_stock(order)
        order.status = 'CANCELLED'
        order.save()

        return Response({"message": "Order cancelled"})

    @action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        order = self.get_object()
        pdf_file = generate_invoice_pdf(order)
        return FileResponse(
            pdf_file,
            as_attachment=True,
            filename=f"invoice_{order.id}.pdf",
            content_type='application/pdf'
        )