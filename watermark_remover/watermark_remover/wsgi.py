"""
WSGI config for watermark_remover project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watermark_remover.settings')
application = get_wsgi_application()
