from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from remover import views

urlpatterns = [
    path('', views.index),
    path('api/upload/', views.upload, name='upload'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
