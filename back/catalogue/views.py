from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Product, Category
from .serializer import ProductSerializer, CategorySerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductRetrieveUpdateDeleteView(APIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
    