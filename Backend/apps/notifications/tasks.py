from celery import shared_task
from django.db.models import Sum, F
from django.utils import timezone

from apps.sales.models import Customer, Order
from apps.inventory.models import Stock
from apps.products.models import Product
from .services import broadcast_dashboard_update, create_notification


@shared_task
def send_dashboard_metrics():
    today = timezone.now().date()
    total_products = Product.objects.count()
    total_customers = Customer.objects.count()
    total_orders = Order.objects.count()
    today_orders = Order.objects.filter(created_at__date=today).count()
    total_sales = float(
        Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    )
    low_stock_items = Stock.objects.filter(quantity__lt=F('low_stock_threshold')).count()

    data = {
        'total_products': total_products,
        'total_customers': total_customers,
        'total_orders': total_orders,
        'today_orders': today_orders,
        'total_sales': total_sales,
        'low_stock_items': low_stock_items,
        'timestamp': str(timezone.now())
    }

    broadcast_dashboard_update(data)
    return data


@shared_task
def check_low_stock_alerts():
    low_stock = Stock.objects.filter(quantity__lt=F('low_stock_threshold'))

    for stock in low_stock:
        create_notification(
            title=f"Low Stock Alert: {stock.product.name}",
            message=f"{stock.product.name} stock is {stock.quantity} in {stock.warehouse.name}",
            notification_type='LOW_STOCK'
        )

    return f"Checked {low_stock.count()} low stock items"
