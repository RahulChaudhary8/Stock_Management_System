from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.StringRelatedField()
    class Meta:
        model = Category
        fields = '__all__'

    def validate_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Category name too short")
        return value


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Brand name too short")
        return value


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

    def validate(self, data):
        phone = data.get("phone")

        if phone and len(phone) < 10:
            raise serializers.ValidationError("Phone number invalid")

        return data

class ProductImageSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
    )

    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'product_name', 'image']


class ProductVariantSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
    )
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    class Meta:
        model = ProductVariant
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    brand_name = serializers.CharField(
        source='brand.name',
        read_only=True
    )
    supplier_name = serializers.CharField(
        source='supplier.name',
        read_only=True
    )

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all()
    )
    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all()
    )
    supplier = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all()
    )

    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Product name too short")
        return value

    def validate_sku(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("SKU too short")
        return value

class ReviewSerializer(serializers.ModelSerializer):
    customer = serializers.CharField(source="customer.name", read_only=True)
    product = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = Review
        fields = "__all__"