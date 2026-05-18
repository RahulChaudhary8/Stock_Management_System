import uuid
from django.db import models
from django.core.exceptions import ValidationError


# 📦 Category (Nested support)
class Category(models.Model):
    name = models.CharField(max_length=255)

    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children"
    )

    def clean(self):
        if self.parent == self:
            raise ValidationError("Category cannot be parent of itself")

    def __str__(self):
        return self.name


# 🏷️ Brand
class Brand(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def clean(self):
        if len(self.name.strip()) < 2:
            raise ValidationError("Brand name too short")

    def __str__(self):
        return self.name


# 🚚 Supplier
class Supplier(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)

    def clean(self):
        if self.phone and len(self.phone) < 10:
            raise ValidationError("Phone number too short")

    def __str__(self):
        return self.name


# 📦 Product
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True)

    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.price <= 0:
            raise ValidationError("Price must be greater than 0")

        if len(self.name) < 3:
            raise ValidationError("Product name too short")

    def __str__(self):
        return self.name


# 🎨 Product Variants (size/color)
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=100, unique=True)

    def clean(self):
        if len(self.name) < 1:
            raise ValidationError("Variant name required")

    def __str__(self):
        return f"{self.product.name} - {self.name}"


# 🖼️ Product Images
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')

    def clean(self):
        if not self.image:
            raise ValidationError("Image required")
        

class Review(models.Model):
    customer = models.ForeignKey(
        'sales.Customer',
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    rating = models.PositiveIntegerField()
    comment = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.name} - {self.product.name}"