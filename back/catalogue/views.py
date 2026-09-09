from rest_framework.views import APIView
from rest_framework import generics
from .models import Product, Category
from .serializer import ProductSerializer, CategorySerializer
from .pagination import ProductPagination


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        queryset = Product.objects.order_by('id')
        name = self.request.query_params.get('name')
        category_id = self.request.query_params.get('category_id')

        if name:
            queryset = queryset.filter(name__icontains=name)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset


class ProductRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
    