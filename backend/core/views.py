from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .crypto_utils import encrypt_aes, decrypt_aes, generate_key_iv
from .models import EncryptedFile
import uuid
import base64

@csrf_exempt
def file_process_view(request):
    if request.method == 'POST' and request.FILES:
        file = request.FILES['file']
        action = request.POST.get('action', '')

        if action == 'encrypt':
            key, iv = generate_key_iv()
            encrypted_data = encrypt_aes(file.read(), key, iv)
            file_uuid = uuid.uuid4()
            EncryptedFile.objects.create(uuid=file_uuid, key=key, iv=iv)
            encoded_data = base64.b64encode(encrypted_data).decode('utf-8')
            return JsonResponse({'uuid': str(file_uuid), 'encrypted_file': encoded_data, 'file_name': file.name + '.enc'})

        elif action == 'decrypt':
            file_uuid = uuid.UUID(request.POST.get('uuid', ''))
            encrypted_file = EncryptedFile.objects.get(uuid=file_uuid)
            decrypted_data = decrypt_aes(file.read(), encrypted_file.key, encrypted_file.iv)
            encoded_data = base64.b64encode(decrypted_data).decode('utf-8')
            # Assuming you have a way to get the original file name, otherwise adjust as needed
            original_file_name = file.name.rsplit('.enc', 1)[0]
            return JsonResponse({'decrypted_file': encoded_data, 'original_name': original_file_name})

    return HttpResponse('Invalid request', status=400)
