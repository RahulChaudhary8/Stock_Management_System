from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum, F
from django.utils import timezone

from .models import Stock
from apps.products.models import Product
from apps.sales.models import Customer, Order
from apps.notifications.services import broadcast_dashboard_update, create_notification, broadcast_inventory_update


def get_dashboard_data():
    total_products = Product.objects.count()
    total_customers = Customer.objects.count()
    total_orders = Order.objects.count()
    today = timezone.now().date()
    today_orders = Order.objects.filter(created_at__date=today).count()
    total_sales = float(Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0)
    low_stock_items = Stock.objects.filter(quantity__lt=F('low_stock_threshold')).count()

    return {
        'total_products': total_products,
        'total_customers': total_customers,
        'total_orders': total_orders,
        'today_orders': today_orders,
        'total_sales': total_sales,
        'low_stock_items': low_stock_items,
        'timestamp': str(timezone.now()),
    }


@receiver(post_save, sender=Stock)
def handle_stock_saved(sender, instance, created, **kwargs):
    broadcast_inventory_update(instance.warehouse.id, {
        'product': instance.product.name,
        'warehouse': instance.warehouse.name,
        'quantity': instance.quantity,
        'low_stock_threshold': instance.low_stock_threshold,
    })

    if instance.quantity < instance.low_stock_threshold:
        create_notification(
            title=f"Low Stock Alert: {instance.product.name}",
            message=f"{instance.product.name} is below the low stock threshold in {instance.warehouse.name}.",
            notification_type='LOW_STOCK'
        )

    broadcast_dashboard_update(get_dashboard_data())
