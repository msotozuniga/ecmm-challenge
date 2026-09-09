from rest_framework import serializers
from .models import Product, Category


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for products

    - category_id: Custom field serializer to override default error messages when updating/creating a model entry
    """

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
    """
    Serializer for categories
    """
    class Meta:
        model = Category
        fields = ['id', 'name']