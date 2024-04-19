# encrypted-file-transfer/backend/urls.py

from django.urls import path, include
from views import index  # Adjusted import depending on your project structure

urlpatterns = [
    path('api/', include('core.urls')),
]
