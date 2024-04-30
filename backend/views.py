# encrypted-file-transfer/backend/views.py

from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import os
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.http import JsonResponse

@csrf_protect
def index(request):
  try:
    with open(os.path.join(settings.REACT_APP_DIR, 'index.html')) as f:
      return HttpResponse(f.read())
  except FileNotFoundError:
    return HttpResponse(
      """
      This URL is only accessible after you've built the React frontend.
      """,
      status=501,
    )
