from rest_framework import serializers
from .models import Product, Category

class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        error_messages={
            "does_not_exist": "Invalid category",
            "incorrect_type": "Invalid category"
        }
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'category_id', 'created_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']