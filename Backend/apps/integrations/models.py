from django.db import models


class IntegrationConfig(models.Model):
    INTEGRATION_TYPES = (
        ('PAYMENT', 'Payment Gateway'),
        ('SHIPPING', 'Shipping API'),
        ('MARKETPLACE', 'Marketplace'),
        ('ERP', 'ERP'),
    )

    name = models.CharField(max_length=255)

    integration_type = models.CharField(
        max_length=50,
        choices=INTEGRATION_TYPES
    )

    api_key = models.CharField(max_length=500, blank=True)
    api_secret = models.CharField(max_length=500, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class APILog(models.Model):
    integration = models.ForeignKey(
        IntegrationConfig,
        on_delete=models.CASCADE
    )

    endpoint = models.CharField(max_length=500)

    request_data = models.JSONField()
    response_data = models.JSONField()

    status_code = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)