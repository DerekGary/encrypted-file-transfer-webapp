# encrypted-file-transfer/backend/urls.py

from django.urls import path, include
from views import index

urlpatterns = [
    path('api/', include('core.urls')),
    path('', index, name='index'), 
]
