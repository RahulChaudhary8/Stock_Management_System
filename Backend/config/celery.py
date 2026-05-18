import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'dashboard-metrics': {
        'task': 'apps.notifications.tasks.send_dashboard_metrics',
        'schedule': crontab(minute='*/5'),
    },
    'low-stock-alerts': {
        'task': 'apps.notifications.tasks.check_low_stock_alerts',
        'schedule': crontab(minute='*/10'),
    },
}
