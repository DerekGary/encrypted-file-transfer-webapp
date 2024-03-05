from django.urls import path
from .views import file_process_view

urlpatterns = [
    path('process_file/', file_process_view, name='file_process_view'),
]