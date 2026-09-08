from django.urls import path

from . import views

urlpatterns = [
    path('api/categories/', views.CategoryListView.as_view(), name='categories'),
    path('api/products/', views.ProductListCreateView.as_view(), name='products'),
    path('api/products/<int:id>/', views.ProductRetrieveUpdateDeleteView.as_view(), name='product')
]