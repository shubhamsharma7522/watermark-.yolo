import os
import uuid
import json
import logging

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from remover.utils import process_image

logger = logging.getLogger(__name__)


def index(request):
    return render(request, 'remover/index.html')


@csrf_exempt
def upload(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)

    f = request.FILES.get('image')
    if not f:
        return JsonResponse({'error': 'No image provided'}, status=400)

    ext = os.path.splitext(f.name)[1].lower()
    if ext not in ('.jpg', '.jpeg', '.png', '.bmp', '.webp'):
        return JsonResponse({'error': 'Unsupported format'}, status=400)

    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(save_path, 'wb') as dest:
        for chunk in f.chunks():
            dest.write(chunk)

    try:
        result = process_image(save_path)
    except Exception as e:
        logger.exception("Processing failed")
        return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({
        'original': f"{settings.MEDIA_URL}{result['original']}",
        'cleaned': f"{settings.MEDIA_URL}{result['cleaned']}",
        'watermarks_found': result['watermarks_found'],
    })
