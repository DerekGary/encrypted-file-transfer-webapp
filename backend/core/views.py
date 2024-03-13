# encrypted-file-transfer/backend/core/views.py

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .crypto_utils import encrypt_aes, decrypt_aes, generate_key_iv
from .models import EncryptedFile
import uuid
import base64
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def test_endpoint(request):
    return JsonResponse({"message": "Test endpoint working!"})

@csrf_exempt
def file_process_view(request):
    try:
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
    except Exception as e:
        logger.error(f"Error processing file: {e}", exc_info=True)
        return HttpResponse('Server Error', status=500)