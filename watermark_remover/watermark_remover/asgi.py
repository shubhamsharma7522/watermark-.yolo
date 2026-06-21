"""
ASGI config for watermark_remover project.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watermark_remover.settings')
application = get_asgi_application()
