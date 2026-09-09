from rest_framework import generics
from .models import Product, Category
from .serializer import ProductSerializer, CategorySerializer
from .pagination import ProductPagination


class CategoryListView(generics.ListAPIView):
    """
    API View for categories model.
    Handles GET methods for URL '/api/categories/'
    
    GET: returns complete list of categories
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListCreateView(generics.ListCreateAPIView):
    """
    API View for products model
    Handles GET, POST methods for URL '/api/products/'

    GET: Obtain list of products based on given filters and pages
    POST: Creates a product. Accepts body params with the same name as the 'product' model fields
    """

    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        """
        Obtains the list of products based on filters.
        Accepts query_params in the request
        - name (string): obtain products that contain the fiven string inside the 'name' field
        - category_id (int): obtain products that contain the given int in the 'category_id' field
        - page (int): page offset of the filtered products
        - page_size (int): amount of products per page
        """

        queryset = Product.objects.order_by('id')
        name = self.request.query_params.get('name')
        category_id = self.request.query_params.get('category_id')

        if name:
            queryset = queryset.filter(name__icontains=name)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset


class ProductRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View for a single product.
    Handles GET, PATCH, PUT, DELETE method for URL '/api/products/{id}/'.
    The product is dictated by the given 'id'.
    
    GET: Obtain the indicated product
    PATCH: Updates the product. Accepts body params with the same name as the 'product' model fields
    PUT: Replaces the product. Accepts body params with the same name as the 'product' model fields
    DELETE: Deletes the product

    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
    