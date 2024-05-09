# Authors: Derek Gary, Takaiya Jones

# Purpose: Specifies the format of our API end-point routes, along with
# what data should be carried with each route from the frontend to the backend.

from django.urls import path
from . import views

urlpatterns = [
    path('file_process/', views.file_process, name='file_process'),
    path('generate_presigned_url/<str:main_id>/<str:sub_id>/', views.generate_presigned_url, name='generate_presigned_url'),
    path('file_process/<str:givenID>/<str:givenSubID>/', views.file_process, name='file_process_with_ids'),
    path('file_limits/', views.file_limits, name='file_limits'),
    path('update_file/<str:main_id>/<str:sub_id>', views.update_file, name='update_file'),
    path('generate_download_link/<str:main_id>/<str:sub_id>/', views.generate_download_link, name='generate_download_link'),

]
