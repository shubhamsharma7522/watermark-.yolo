from django.test import SimpleTestCase, Client
from django.urls import reverse


class RemoverViewTests(SimpleTestCase):
    """Basic smoke tests for the remover app views."""

    def setUp(self):
        self.client = Client()

    def test_index_get(self):
        """Homepage loads successfully."""
        response = self.client.get(reverse("remover:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Watermark Remover")

    def test_upload_api_get_rejected(self):
        """GET requests to the upload API are rejected."""
        response = self.client.get(reverse("remover:upload_api"))
        self.assertEqual(response.status_code, 405)

    def test_upload_api_post_no_file(self):
        """POST without a file returns a validation error."""
        response = self.client.post(reverse("remover:upload_api"))
        self.assertEqual(response.status_code, 400)
