from django.db import models
from django.core.exceptions import ValidationError


class Warehouse(models.Model):
    TYPES = (
        ("GENERAL", "General"),
        ("COLD", "Cold Storage"),
        ("FULFILLMENT", "Fulfillment"),
    )

    name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255)

    manager_name = models.CharField(
    max_length=255,
    blank=True,
    null=True,
    default=""
)
    manager_contact = models.CharField(
    max_length=20,
    blank=True,
    null=True,
    default=""
)

    warehouse_type = models.CharField(
        max_length=20,
        choices=TYPES
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return self.name

class Rack(models.Model):
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="racks"
    )

    rack_code = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()

    occupied = models.PositiveIntegerField(default=0)

    def clean(self):
        if self.occupied > self.capacity:
            raise ValidationError("Occupied cannot exceed capacity")

    class Meta:
        unique_together = ('warehouse', 'rack_code')