from django.urls import path, include, re_path
from views import index

urlpatterns = [
    path('api/', include('core.urls')),  # Prefix all your API URLs with 'api/'
    path('', index, name='index'), 
]
