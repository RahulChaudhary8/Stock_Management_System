from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum, F
from django.utils import timezone

from .models import Order, Customer
from apps.inventory.models import Stock
from apps.products.models import Product
from apps.notifications.services import broadcast_dashboard_update, create_notification, broadcast_sales_update


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


@receiver(post_save, sender=Order)
def handle_order_saved(sender, instance, created, **kwargs):
    if created:
        create_notification(
            title="New Order Received",
            message=f"Order {instance.id} was created for {instance.customer.name}.",
            notification_type='ORDER_CREATED'
        )

    broadcast_sales_update({
        'order_id': str(instance.id),
        'status': instance.status,
        'total_amount': float(instance.total_amount),
        'customer': instance.customer.name,
        'created_at': instance.created_at.isoformat(),
    })

    broadcast_dashboard_update(get_dashboard_data())
