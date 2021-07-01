"""
Тесты
"""

from django.urls import reverse
from django.test import TestCase, Client

from app.api.models import User


class AuthTestCase(TestCase):

    def test_authorisation(self):
        response = self.client.post(reverse('api:login'), data={'username': 'dxd', 'password': 'dxddxddxd'},
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)


class IndexTestCase(TestCase):
    fixtures = ['test_database.json']

    def setUp(self) -> None:
        self.client = Client()
        self.user = User.objects.get(username='dxd')
        self.client.force_login(self.user)
        self.response = self.client.get(reverse('dnevnik:index'))

    def test_unauthorised_response(self):
        client = Client()
        response = client.get(reverse('dnevnik:index'), follow=False)
        self.assertEqual(302, response.status_code)
        response = client.get(reverse('dnevnik:index'), follow=True)
        self.assertEqual(reverse('dnevnik:auth'), response.wsgi_request.path)

    def test_authenticated_response(self):
        self.assertEqual(self.response.status_code, 200)

    def test_lohout(self):
        response = self.client.post(reverse('api:logout'))
        self.assertEqual(response.status_code, 200)


class WatchConferenceTestCase(TestCase):
    fixtures = ['test_database.json']

    def setUp(self) -> None:
        self.client = Client()
        self.teacher = User.objects.get(username='dxd')
        self.student = User.objects.get(username='student')
        self.client.force_login(self.teacher)
        self.response = self.client.get(reverse('dnevnik:index'))

    def test_teacher_watch_conference(self):
        self.assertEqual(self.response.status_code, 200)

    def test_student_watch_conference(self):
        self.client.force_login(self.student)
        self.assertEqual(self.response.status_code, 200)
