# ./backend/core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # path('test/', views.test_endpoint, name='test_endpoint'),
    # path('generate_username/', views.generate_username, name='generate_username'),
    # path('register/', views.register, name='register'),
    # path('logout/', views.logout_view, name='logout'),
    # path('login/', views.login_view, name='login'),
    path('file_process/', views.file_process, name='file_process'),
    path('file_limits/', views.file_limits, name='file_limits'),
    path('test_s3_connection/', views.test_s3_connection, name='test_s3_connection'),
    path('test_headers/', views.test_headers, name='test_headers'),
    path('test_csrf_and_headers/', views.test_csrf_and_headers, name='test_csrf_and_headers'),
]