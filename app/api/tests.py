"""
Тесты
"""

from django.urls import reverse
from django.test import TestCase, Client

from app.api.models import User
from app.uchebnik.models import Exercise


class AuthTestCase(TestCase):

    def test_invalid_login(self):
        response = self.client.post(reverse('api:login'), data={'username': 'not_dxd', 'password': 'not_dxddxddxd'},
                                    content_type='application/json')
        self.assertEqual(response.content.decode("utf-8"), 'auth error')

    def test_login_invalid_username(self):
        response = self.client.post(reverse('api:login'), data={'username': 'not_dxd', 'password': 'dxddxddxd'},
                                    content_type='application/json')
        self.assertEqual(response.content.decode("utf-8"), 'auth error')

    def test_login_invalid_password(self):
        response = self.client.post(reverse('api:login'), data={'username': 'dxd', 'password': 'not_dxddxddxd'},
                                    content_type='application/json')
        self.assertEqual(response.content.decode("utf-8"), 'auth error')

    def test_invalid_login_method(self):
        response = self.client.get(reverse('api:login'))
        self.assertEqual(response.content.decode("utf-8"), 'method not allowed')

    def test_invalid_logout_method(self):
        response = self.client.get(reverse('api:logout'))
        self.assertEqual(response.content.decode("utf-8"), 'method not allowed')

    def test_register(self):
        response = self.client.post(reverse('api:register'), data={'username': 'new_dxd', 'email': 'new_dxd@mail.ru',
                                                                   'password1': 'new_dxddxddxd',
                                                                   'password2': 'new_dxddxddxd', },
                                    content_type='application/json')
        self.assertEqual(response.content.decode("utf-8"), 'success')

    def test_register_pass_didnt_match(self):
        response = self.client.post(reverse('api:register'), data={'username': 'new_dxd', 'email': 'new_dxd@mail.ru',
                                                                   'password1': 'new_dxddxddxd',
                                                                   'password2': 'old_dxddxddxd', },
                                    content_type='application/json')
        self.assertEqual(response.content.decode("utf-8"), 'passwords doesn\'t match')

    def test_invalid_register_method(self):
        response = self.client.get(reverse('api:register'))
        self.assertEqual(response.content.decode("utf-8"), 'method not allowed')


class ExerciseTestCase(TestCase):
    fixtures = ['test_database.json']

    def setUp(self) -> None:
        self.client = Client()
        self.user = User.objects.get(username='dxd')
        self.client.force_login(self.user)
        self.response = self.client.post(reverse('api:get_exercise_data'), kwargs={'pk':1})

    def test_invalid_exercise_data_method(self):
        self.assertEqual(self.response.content.decode("utf-8"), 'method not allowed')

    def test_get_exercise_data(self):
        pass
