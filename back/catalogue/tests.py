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

	def test_put_updates_a_product(self):
		product = Product.objects.get(name='Dental Mirror')
		response = self.client.put(
			'/api/products/{}/'.format(product.id),
			{
				'name': 'Dental Explorer',
				'description': 'Explorer',
				'price': '12.500',
				'stock': 8,
				'category': self.category.id,
			},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['name'], 'Dental Explorer')
		product.refresh_from_db()
		self.assertEqual(product.name, 'Dental Explorer')
		self.assertEqual(product.description, 'Explorer')
		self.assertEqual(str(product.price), '12.500')
		self.assertEqual(product.stock, 8)

	def test_post_rejects_missing_name(self):
		response = self.client.post('/api/products/', {
			'description': 'Probe',
			'price': '15.500',
			'stock': 3,
			'category': self.category.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('name', response.data)
		self.assertTrue(response.data['name'])

	def test_post_rejects_negative_price(self):
		response = self.client.post('/api/products/', {
			'name': 'Dental Probe',
			'description': 'Probe',
			'price': '-1.000',
			'stock': 3,
			'category': self.category.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('price', response.data)
		self.assertTrue(response.data['price'])

	def test_post_rejects_non_numeric_stock(self):
		response = self.client.post('/api/products/', {
			'name': 'Dental Probe',
			'description': 'Probe',
			'price': '15.500',
			'stock': 'three',
			'category': self.category.id,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('stock', response.data)
		self.assertTrue(response.data['stock'])

	def test_post_rejects_missing_category(self):
		response = self.client.post('/api/products/', {
			'name': 'Dental Probe',
			'description': 'Probe',
			'price': '15.500',
			'stock': 3,
			'category': 999,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('category', response.data)
		self.assertIn('Invalid category', str(response.data['category']))

	def test_post_reports_all_validation_errors(self):
		response = self.client.post('/api/products/', {
			'price': '-1.000',
			'stock': 'three',
			'category': 999,
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('name', response.data)
		self.assertIn('price', response.data)
		self.assertIn('stock', response.data)
		self.assertIn('category', response.data)
		self.assertTrue(response.data['name'])
		self.assertTrue(response.data['price'])
		self.assertTrue(response.data['stock'])
		self.assertIn('Invalid category', str(response.data['category']))


class ProductRetrieveUpdateDeleteViewTests(APITestCase):
	def setUp(self):
		self.category = Category.objects.create(name='Dental')
		self.product = Product.objects.create(
			name='Dental Mirror',
			description='Mirror',
			price='10.000',
			stock=5,
			category=self.category,
		)

	def test_get_returns_a_product(self):
		response = self.client.get('/api/products/{}/'.format(self.product.id))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['id'], self.product.id)
		self.assertEqual(response.data['name'], 'Dental Mirror')

	def test_patch_updates_a_product(self):
		response = self.client.patch(
			'/api/products/{}/'.format(self.product.id),
			{'name': 'Dental Explorer', 'stock': 8},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['name'], 'Dental Explorer')
		self.assertEqual(response.data['stock'], 8)
		self.product.refresh_from_db()
		self.assertEqual(self.product.name, 'Dental Explorer')

	def test_delete_removes_a_product(self):
		response = self.client.delete('/api/products/{}/'.format(self.product.id))

		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Product.objects.filter(id=self.product.id).exists())


class CategoryListViewTests(APITestCase):
	def test_get_returns_categories(self):
		Category.objects.create(name='Dental')
		Category.objects.create(name='Surgical')

		response = self.client.get('/api/categories/')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 2)
		self.assertEqual(
			{category['name'] for category in response.data},
			{'Dental', 'Surgical'},
		)

	def test_post_creates_a_category(self):
		response = self.client.post('/api/categories/', {
			'name': 'Orthodontics',
		}, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(Category.objects.filter(name='Orthodontics').exists())

	def test_post_rejects_missing_name(self):
		response = self.client.post('/api/categories/', {}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('name', response.data)
		self.assertTrue(response.data['name'])
