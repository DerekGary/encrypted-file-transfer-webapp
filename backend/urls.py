# Authors: Derek Gary, Takaiya Jones

# Purpose: Serves as the project level routing.
# First route that is hit for requests.
# Routes data to our 'core' application for further
# routing.

from django.urls import path, include
from views import index

urlpatterns = [
    path('api/', include('core.urls'), name='api'),
    path('/', index, name='index'),
]
