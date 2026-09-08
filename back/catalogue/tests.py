from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product


class ProductListCreateViewTests(APITestCase):
	def setUp(self):
		self.category = Category.objects.create(name='Dental')
		other_category = Category.objects.create(name='Surgical')
		Product.objects.create(
			name='Dental Mirror',
			description='Mirror',
			price='10.000',
			stock=5,
			category=self.category,
		)
		Product.objects.create(
			name='Surgical Gloves',
			description='Gloves',
			price='20.000',
			stock=10,
			category=other_category,
		)

	def test_get_filters_by_name_and_category_and_paginates(self):
		response = self.client.get(
			'/api/products/?name=mirror&category={}&page_size=1'.format(self.category.id)
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 1)
		self.assertEqual(len(response.data['results']), 1)
		self.assertEqual(response.data['results'][0]['name'], 'Dental Mirror')

	def test_post_creates_a_product(self):
		response = self.client.post('/api/products/', {
			'name': 'Dental Probe',
			'description': 'Probe',
			'price': '15.500',
			'stock': 3,
			'category': self.category.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(Product.objects.filter(name='Dental Probe').exists())
