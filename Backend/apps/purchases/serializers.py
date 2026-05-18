from rest_framework import serializers
from .models import *


class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        purchase = PurchaseOrder.objects.create(**validated_data)

        total = 0

        for item in items_data:
            obj = PurchaseItem.objects.create(
                purchase_order=purchase,
                **item
            )
            total += obj.quantity * obj.cost_price

        purchase.total_amount = total
        purchase.save()

        return purchase
    
class SupplierPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierPayment
        fields = '__all__'