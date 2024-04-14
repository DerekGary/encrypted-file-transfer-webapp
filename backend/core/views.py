from django.http import JsonResponse, HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
# import djang_login 
from django.contrib.auth import login as django_login

from .crypto_utils import encrypt_aes, decrypt_aes, generate_key_iv
from .models import EncryptedFile
import uuid
import base64
import logging

logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@csrf_exempt
@api_view(['GET'])
def test_endpoint(request):
    return JsonResponse({"message": "Test endpoint working!"})

@csrf_exempt
@api_view(['GET'])
def generate_username(request):
    logger.info("Frontend has requested the generated username.")
    return JsonResponse({'username': 'Derek Gary'})

@csrf_exempt
@api_view(['POST'])
def file_process_view(request):
    if request.method == 'POST' and request.FILES:
        file = request.FILES['file']
        action = request.POST.get('action', '')
        logger.info(f"Processing file for action: {action}")

        if action == 'encrypt':
            key, iv = generate_key_iv()
            encrypted_data = encrypt_aes(file.read(), key, iv)
            file_uuid = uuid.uuid4()
            EncryptedFile.objects.create(uuid=file_uuid, key=key, iv=iv)
            encoded_data = base64.b64encode(encrypted_data).decode('utf-8')
            logger.info(f"File encrypted successfully with UUID: {file_uuid}")
            return JsonResponse({'uuid': str(file_uuid), 'encrypted_file': encoded_data, 'file_name': file.name + '.enc'})

        elif action == 'decrypt':
            file_uuid = uuid.UUID(request.POST.get('uuid', ''))
            encrypted_file = EncryptedFile.objects.get(uuid=file_uuid)
            decrypted_data = decrypt_aes(file.read(), encrypted_file.key, encrypted_file.iv)
            encoded_data = base64.b64encode(decrypted_data).decode('utf-8')
            original_file_name = file.name.rsplit('.enc', 1)[0]
            logger.info(f"File decrypted successfully for UUID: {file_uuid}")
            return JsonResponse({'decrypted_file': encoded_data, 'original_name': original_file_name})

    return HttpResponse('Invalid request', status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_409_CONFLICT)
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already in use"}, status=status.HTTP_409_CONFLICT)

    user = User.objects.create_user(username=username, email=email, password=password)
    tokens = get_tokens_for_user(user)
    response = JsonResponse({"detail": "User registered successfully"})
    response.set_cookie(key='access', value=tokens['access'], httponly=True, samesite='Lax')
    response.set_cookie(key='refresh', value=tokens['refresh'], httponly=True, samesite='Lax')
    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    refresh_token = request.COOKIES.get('refresh')
    refresh = RefreshToken(refresh_token)
    new_token = refresh.access_token
    response = JsonResponse({"detail": "Token refreshed successfully"})
    response.set_cookie(key='access', value=str(new_token), httponly=True, samesite='Lax')
    return response

@api_view(['POST'])
def logout(request):
    response = JsonResponse({"detail": "Logged out"})
    response.delete_cookie('access')
    response.delete_cookie('refresh')
    return response

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    # Retrieve username and password from request data
    username = request.data.get('username')
    password = request.data.get('password')

    # Log initial login attempt with obscured password for security
    logger.info(f"Login attempt for username: {username} with obscured password")

    # Attempt to authenticate the user
    user = authenticate(request, username=username, password=password)

    if user is not None:
        # Log pre-login success
        logger.info(f"User {username} authenticated successfully, proceeding with login.")

        django_login(request, user)  # Log the user in

        # Assuming `get_tokens_for_user` is a function you have defined to generate JWT tokens
        tokens = get_tokens_for_user(user)

        # Create a response object to return the success detail
        response = JsonResponse({'detail': 'Login successful'})

        # Set secure, HTTP-only cookies for the access and refresh tokens
        response.set_cookie(key='access', value=tokens['access'], httponly=True, samesite='Lax', secure=True)
        response.set_cookie(key='refresh', value=tokens['refresh'], httponly=True, samesite='Lax', secure=True)

        logger.info(f"Login and token generation successful for username: {username}")
        return response
    else:
        # Log failed login attempt details, including username and that the credentials were rejected
        logger.error(f"Failed login attempt for username: {username}. Incorrect credentials provided.")
        return JsonResponse({'error': 'Invalid username or password'}, status=401)
    
    def file_upload(request):
        return JsonResponse({"message": "File upload endpoint"})