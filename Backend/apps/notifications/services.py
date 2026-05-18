from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification
from apps.users.models import User


def create_notification(title, message, notification_type):
    users = User.objects.all()
    channel_layer = get_channel_layer()

    for user in users:
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type
        )

        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "send_notification",
                "title": title,
                "message": message,
                "notification_type": notification_type,
            }
        )


def broadcast_dashboard_update(data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'dashboard',
        {
            'type': 'dashboard_update',
            'data': data,
        }
    )


def broadcast_inventory_update(warehouse_id, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'inventory_{warehouse_id}',
        {
            'type': 'stock_update',
            'data': data,
        }
    )


def broadcast_sales_update(data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'sales_updates',
        {
            'type': 'sales_update',
            'data': data,
        }
    )