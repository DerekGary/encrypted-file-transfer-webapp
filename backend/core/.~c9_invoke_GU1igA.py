# backend/core/views.py

from django.http import JsonResponse, HttpResponse
import boto3
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import AllowAny, IsAuthenticated

from .crypto_utils import encrypt_aes, decrypt_aes, generate_key_iv
from .models import EncryptedFile
import uuid
import base64
import logging

logger = logging.getLogger(__name__)

# @csrf_exempt
# @api_view(['GET'])
# def test_endpoint(request):
#     return JsonResponse({"message": "Test endpoint working!"})

# @csrf_exempt
# @api_view(['GET'])
# def generate_username(request):
#     logger.info("Frontend has requested the generated username.")
#     return JsonResponse({'username': 'Derek Gary'})

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def register(request):
#     username = request.data.get('username')
#     password = request.data.get('password')
#     email = request.data.get('email')
    
#     if User.objects.filter(username=username).exists():
#         return Response({"error": "Username already taken"}, status=status.HTTP_409_CONFLICT)
#     if User.objects.filter(email=email).exists():
#         return Response({"error": "Email already in use"}, status=status.HTTP_409_CONFLICT)

#     user = User.objects.create_user(username=username, email=email, password=password)
#     login(request, user)  # Log the user in, Django handles cookie setting
#     return JsonResponse({"detail": "User registered successfully"})

# @api_view(['POST'])
# def logout_view(request):
#     logout(request)  # Django clears the session
#     response = JsonResponse({"detail": "Logged out"})
#     response.delete_cookie('sessionid')  # Ensure to delete the sessionid cookie
#     return response

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login_view(request):
#     username = request.data.get('username')
#     password = request.data.get('password')
#     user = authenticate(request, username=username, password=password)
#     if user is not None:
#         login(request, user)  # Log the user in, Django handles cookie setting
#         return JsonResponse({'detail': 'Login successful'})
#     else:
#         return JsonResponse({'error': 'Invalid username or password'}, status=401)



@api_view(['POST'])
def file_process(request):
    if request.method == 'POST' and request.FILES:
        file = request.FILES['file']
        action = request.POST.get('action', '')
        logger.info(f"Received file for action {action}.")
        return JsonResponse({'message': 'File processed successfully'})
    return JsonResponse({'error': 'Invalid request'}, status=400)




@csrf_exempt
@api_view(['GET'])
def test_s3_connection(request):
    """
    Test connectivity to AWS S3 by listing the buckets available.
    """
    s3_client = boto3.client('s3')
    try:
        # Attempt to list buckets
        response = s3_client.list_buckets()
        
        # Extract bucket names to demonstrate connectivity
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        return JsonResponse({'message': 'Successfully connected to S3.', 'buckets': buckets})
        
        # Log Error Messagge to Docker Logs in case of failure.
    except Exception as e:
        logger.error(f"\n\n\n == S3 BUCKET ERROR == \n\n\nFailed to connect to S3: {str(e)}\n\n\n")
        return JsonResponse({'error': f"Failed to connect to S3: {str(e)}"}, status=500)



@api_view(['GET'])
@permission_classes([AllowAny])
def test_headers(request):
    """
    Return the headers received from the request.
    """
    headers = dict(request.headers)
    return JsonResponse({'received_headers': headers})
    
    
    
@api_view(['POST'])
@ensure_csrf_cookie
@permission_classes([AllowAny])
def test_csrf_and_headers(request):
    """
    Return the headers received and compare them to expected CSRF tokens.
    """
    received_headers = dict(request.headers)
    expected_token = request.META.get('CSRF_COOKIE', 'No CSRF cookie found')
    return JsonResponse({
        'received_headers': received_headers,
        'expected_csrf_token': expected_token
    })
