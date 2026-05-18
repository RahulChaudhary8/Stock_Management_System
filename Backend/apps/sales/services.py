from apps.inventory.models import Stock
from apps.notifications.services import create_notification


def deduct_stock(order):
    for item in order.items.all():
        stock = Stock.objects.get(
            product=item.product,
            warehouse=order.warehouse
        )

        if stock.quantity < item.quantity:
            raise ValueError("Insufficient stock")

        stock.quantity -= item.quantity
        stock.save()

        # Notification
        if stock.quantity == 0:
            create_notification(
                "Out Of Stock",
                f"{item.product.name} is out of stock",
                "OUT_OF_STOCK"
            )


def restore_stock(order):
    for item in order.items.all():
        stock = Stock.objects.get(
            product=item.product,
            warehouse=order.warehouse
        )

        stock.quantity += item.quantity
        stock.save()