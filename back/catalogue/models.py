from django.db import models
from decimal import Decimal
from django.core.validators import MinValueValidator

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[
            MinValueValidator(Decimal("0.0"))
        ])
    stock = models.PositiveIntegerField()
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["name"])
        ]

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Category"
        
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name
