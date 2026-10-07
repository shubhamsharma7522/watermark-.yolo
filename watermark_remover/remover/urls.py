from django.urls import path
from remover import views

app_name = "remover"

urlpatterns = [
    path("", views.index, name="index"),
    path("api/upload/", views.upload, name="upload_api"),
]
