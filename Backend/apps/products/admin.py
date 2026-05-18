from django.contrib import admin

from .models import Brand, Category, Product, ProductVariant, Review, Supplier, ProductImage

# Register your models here.
admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Supplier)
admin.site.register(Brand)
admin.site.register(ProductVariant)
admin.site.register(ProductImage)
admin.site.register(Review)