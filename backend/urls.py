# Authors: Derek Gary, Takaiya Jones

# Purpose: Serves as the project level routing.
# First point that is hit for requests.
# Routes data to our 'core' application for further
# routing.

from django.urls import path, include
from views import index  # Adjusted import depending on your project structure

urlpatterns = [
    path('api/', include('core.urls'), name='api'),
    path('/', index, name='index'),
]
