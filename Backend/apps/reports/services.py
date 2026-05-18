from django.db.models import Sum, Count
from apps.sales.models import OrderItem, Order
from apps.purchases.models import PurchaseOrder
from apps.inventory.models import Stock
from apps.warehouse.models import Warehouse


def dashboard_stats():
    total_sales = Order.objects.filter(
        status='CONFIRMED'
    ).aggregate(total=Sum('total_amount'))['total'] or 0

    total_purchases = PurchaseOrder.objects.filter(
        status='RECEIVED'
    ).aggregate(total=Sum('total_amount'))['total'] or 0

    low_stock_count = Stock.objects.filter(
        quantity__lte=10
    ).count()

    total_warehouses = Warehouse.objects.count()

    return {
        "total_sales": total_sales,
        "total_purchases": total_purchases,
        "low_stock_count": low_stock_count,
        "total_warehouses": total_warehouses
    }


def top_products():
    return OrderItem.objects.values(
        'product__name'
    ).annotate(
        total_sold=Sum('quantity')
    ).order_by('-total_sold')[:10]


def warehouse_performance():
    return Warehouse.objects.annotate(
        stock_count=Count('stock')
    ).values('name', 'stock_count')