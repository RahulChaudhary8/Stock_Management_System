from apps.inventory.models import Stock
from apps.notifications.services import create_notification


def receive_stock(purchase_order):
    for item in purchase_order.items.all():

        stock, created = Stock.objects.get_or_create(
            product=item.product,
            warehouse=purchase_order.warehouse,
            defaults={'quantity': 0}
        )

        stock.quantity += item.quantity
        stock.save()

    create_notification(
        "Purchase Received",
        f"Purchase Order {purchase_order.id} received",
        "PURCHASE"
    )