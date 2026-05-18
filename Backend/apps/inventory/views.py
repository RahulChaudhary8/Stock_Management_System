from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.warehouse.models import Warehouse
from .models import Stock, StockTransaction
from .serializers import StockSerializer, StockTransactionSerializer


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    @action(detail=True, methods=['post'])
    def stock_in(self, request, pk=None):
        stock = self.get_object()
        qty = int(request.data.get('quantity'))

        stock.quantity += qty
        stock.save()

        StockTransaction.objects.create(
            product=stock.product,
            warehouse=stock.warehouse,
            transaction_type='IN',
            quantity=qty
        )

        return Response({"message": "Stock added"})

    @action(detail=False, methods=['post'])
    def receive(self, request):
        product_id = request.data.get('product_id')
        warehouse_id = request.data.get('warehouse_id')
        quantity = int(request.data.get('quantity', 0))

        if quantity <= 0 or not product_id:
            return Response({"error": "product_id and positive quantity are required"}, status=400)

        if not warehouse_id:
            warehouse = Warehouse.objects.first()
            if not warehouse:
                return Response({"error": "No warehouse configured"}, status=400)
            warehouse_id = warehouse.id

        stock, created = Stock.objects.get_or_create(
            product_id=product_id,
            warehouse_id=warehouse_id,
            defaults={"quantity": 0}
        )

        stock.quantity += quantity
        stock.save()

        StockTransaction.objects.create(
            product_id=product_id,
            warehouse_id=warehouse_id,
            transaction_type='IN',
            quantity=quantity
        )

        return Response({"message": "Stock received", "stock_id": stock.id})


    @action(detail=True, methods=['post'])
    def stock_out(self, request, pk=None):
        stock = self.get_object()
        qty = int(request.data.get('quantity'))

        if stock.quantity < qty:
            return Response({"error": "Not enough stock"})

        stock.quantity -= qty
        stock.save()

        StockTransaction.objects.create(
            product=stock.product,
            warehouse=stock.warehouse,
            transaction_type='OUT',
            quantity=qty
        )

        return Response({"message": "Stock deducted"})