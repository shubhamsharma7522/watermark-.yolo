"""Minimal Django settings — no database, no admin."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-wm-remover-dev-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.staticfiles',
    'remover',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'watermark_remover.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.template.context_processors.static',
                'django.template.context_processors.media',
            ],
        },
    },
]

# No database
DATABASES = {}

# Static
STATIC_URL = '/static/'

# Media
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
UPLOAD_DIR = MEDIA_ROOT / 'uploads'
OUTPUT_DIR = MEDIA_ROOT / 'outputs'

for d in [UPLOAD_DIR, OUTPUT_DIR]:
    os.makedirs(d, exist_ok=True)

# File upload
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

# YOLO model
YOLO_MODEL_REPO = 'corzent/yolo11x_watermark_detection'
YOLO_MODEL_FILENAME = 'best.pt'
YOLO_MODEL_LOCAL_DIR = BASE_DIR / 'models'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
