# encrypted-file-transfer/backend/core/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('process_file/', views.file_process_view, name='file_process_view'),
    path('test/', views.test_endpoint, name='test_endpoint'),
    path('generate_username/', views.generate_username, name='generate_username'),
]