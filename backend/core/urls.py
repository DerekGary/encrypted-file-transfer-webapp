# ./backend/core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('file_process/', views.file_process, name='file_process'),
    path('file_limits/', views.file_limits, name='file_limits'),
    path('test_s3/', views.test_s3, name='test_s3'),
    path('test_headers/', views.test_headers, name='test_headers'),
    path('set_test_cookie/', views.set_test_cookie, name='set_test_cookie'),
    path('test_csrf_and_headers/', views.test_csrf_and_headers, name='test_csrf_and_headers'),
    path('update_file/<str:main_id>/', views.update_file, name='update_file'),
]