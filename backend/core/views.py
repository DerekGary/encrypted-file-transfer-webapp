# Authors: Derek Gary, Takaiya Jones

# These are the API endpoints utilized by our React frontend.

# Handles the following operations:
# DB object creation and metadata storage
# Cryptographically secure ID and SubID generation
# S3 client connection
# S3 Pre-Signed URL Generation
# File Size verification

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect

from .models import SecureFileUpload

import uuid
import base64
import logging
import random
import string
import secrets
import datetime

# S3 Imports
import boto3
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.exceptions import NoCredentialsError, ClientError
from botocore.client import Config
import requests


logger = logging.getLogger(__name__)

# Below we've added in some helpful documentation to help you understand what is happening,
# as well as to elaborate on different topics related to this code file.

# @api_view is a part of the Django REST framework, and indicates the requests that can be
# handled by this method. API operations are the actions your API endpoints can perform. 

# These are typically aligned with HTTP methods:
# GET: Retrieve data
# POST: Create new data
# PUT: Update existing data
# DELETE: Delete data

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def file_process(request, givenID=None, givenSubID=None):
    if request.method == 'POST':
        
        
        ### Cryptographically Secure Pseudorandom Number Generation (CSPRNG) (for: Main ID and Sub ID) ###
        
        # Use a CSPRNG from the Python Secrets library to generate a random
        # main ID and sub ID for a valid file which needs encryption on the frontend.
        
        # IMPORTANT! Don't ever use the Python 'random' module for generating secrets
        # or cryptographic values.
        
        #The 'random' module is suitable for simulations and games but not for security-critical applications
        # where unpredictability is essential. Instead, always use the 'secrets' module for
        # generating secure random numbers, which provides access to the most secure
        # source of randomness that your operating system offers.
        
        # ^ This means that the 'secrets' module is sort of like a wrapper around your operating system's cryptographic solutions,
        # but the difference being that Python smartly chooses the best available solution for generating cryptographically secure 
        # random numbers. So the 'randomness,' or entropy, does change slightly across different systems. 
        
        # This also means that if you are using them in containerized environments (VMs), like ours, then this randomness can be
        # affected based on if the containers were spun up at the same time with similar profiles. Usually it means these operations take longer on VMs,
        # but the number itself should remain secure.
        # Here's an old article that we read through that explains this niche topic: `https://strugglers.net/~andy/blog/2010/06/06/adventures-in-entropy-part-1/#Content-bal-title`
        
        ## Pythonic Note ##
        # for _ in range(24) is syntactic sugar in Python.
        # It simplifies the execution of a loop fixed to 24 iterations. 
        # The underscore '_' is used as a placeholder variable name,
        # indicating that the loop variable is unnecessary and not used within the loop body.
        # This is commonly used when the repeat action is required a specific number of times,
        # but the individual iteration index is irrelevant. Think about all of the times you've
        # used variables like 'i' in a loop, but you did not use that variable later on in your
        # code. We can use this instead to make our code more readable.
        
        # Let's first create a string of all ascii leters and digits 0-9 for our CSPRNG to use in the creation of a mainID and subID.
        alpha = string.ascii_letters + string.digits
        
        main_id = ''.join(secrets.choice(alpha) for _ in range(24))
        sub_id = ''.join(secrets.choice(alpha) for _ in range(32))
        file_size = 0
        created_at = timezone.now()
        
        # Let's also create an object in our DB to hold necessary metadata for
        # an encrypted file. Outside of the IDs and created_at var, we can just
        # think of these as placeholders to contain our actual values.
        secure_file_upload = SecureFileUpload.objects.create(
            main_id=main_id,
            sub_id=sub_id,
            file_size=file_size,
            created_at=created_at,
            file_name="",
        )
        
        # This line was used earlier in the development process, but I've just kept it in for now.
        download_url = f'https://test-server-0.click/download/{main_id}/{sub_id}/'

        # Let's structure the data available for the frontend to access.
        # The keys here ('id', 'subId', etc.) will be referenced by the
        # frontend for assignment and access.
        response_data = {
            'id': secure_file_upload.main_id,
            'subId': secure_file_upload.sub_id,
            'fileSize': secure_file_upload.file_size,
            'created': secure_file_upload.created_at.isoformat(),
            'fileName': secure_file_upload.file_name,
            'downloadUrl': download_url,
        }
        
        # Generally, we should always return a response to the frontend with a status code.
        # This can help with debugging if something goes wrong.
        return Response(response_data, status=status.HTTP_200_OK)
    
    # Given a GET Request from the frontend, carrying with it a main_id and sub_id
    # that successfully matches a DB object, then send the metadata
    # for this file back to the frontend for either update or display on the download page.
    elif request.method == 'GET' and givenID is not None and givenSubID is not None:
        
        # Try/Except is your friend whenever it comes to debugging. Use it whenever you can.
        # It doesn't take the place of testing, but it can save your ass.
        try:
            secure_file = SecureFileUpload.objects.get(main_id=givenID, sub_id=givenSubID)
            response_data = {
                'id': secure_file.main_id,
                'subId': secure_file.sub_id,
                'fileSize': secure_file.file_size,
                'created': secure_file.created_at.isoformat(),
                'fileName': secure_file.file_name,
            }
            return Response(response_data, status=status.HTTP_200_OK)
            
        # If we get this response, then we know it's this code block causing the issue.
        except SecureFileUpload.DoesNotExist:
            return Response({'error': 'Invalid file request'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)


###### S3 Object Key and Pre-Signed Upload URL Creation ######

# Presigned_url represents the upload link to serve up to our frontend. 
# The download link will be generated separately.
# Why? The upload links only should exist for the maximum amount of time
# needed for the frontend to upload a file. Someone could wait 10 hours before
# they'd like to download a file, but the upload process is dictacted by the speed
# of our frontend oprations.
def generate_presigned_url(request, main_id, sub_id):
    
    # Don't allow upload link generation if a main_id and sub_id hasn't been passed to the backend.
    if not main_id and not sub_id:
        return JsonResponse({'error': 'Missing main_id and/or sub_id'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Object keys within our S3 bucket (used to grab or place encrypted files into our S3 bucket), are generated by combining both IDs.
    # This ensures that object retrieval assumes the same level of cryptographic security that was provided from our ID generation seen
    # above.
    
    # To complete S3 get/put ops, we will need an object_key and bucket_name.
    object_key = f'{main_id}{sub_id}'
    bucket_name = settings.AWS_S3_BUCKET_NAME
    
    # Let's not continue presigned URL generation if the given main id and sub id received from the frontend
    # doesn't actually match an existing file's metadata in our db. We don't need people spoofing this data,
    # possibly bypassing our file size restrictions, and ultimately misusing our S3 container to upload files
    # that may not be encrypted using our solution.
    try:
        SecureFileUpload.objects.get(main_id=main_id, sub_id=sub_id)
    except SecureFileUpload.DoesNotExist:
        return JsonResponse({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # To add, let's not continue presigned URL generation if our S3 environment variables don't match back to an authorized
    # S3 user. This is definitely a given, but structuring our program in this way ensures that we are handling errors correctly.
    
    ## General AWS Info ##
    # What is meant by an S3 User?
    # Let's break it down:
    # 1. A user assumes an Identity and Access Management (IAM) role.
    # 2. An IAM role assumes specific policies.
    # 3. A policy is a collection of permissions.
    # 4. A permission specifies the allowed or denied actions on AWS resources.
    # 5. Our S3 bucket constitutes an AWS resource.
    
    # These permissions can include actions such as reading, writing, and deleting objects within specific S3 buckets.
    # Ensuring that users can only interact with resources according to the security policies established by the administrators.
    
    ## S3 Authorization and Client Connection Explained ##
    #
    # There are generally two ways that AWS can authorize actions to be performed on existing AWS resources:
    #
    # 1. AWS Managed Identity and Access Management (IAM) Based Role - Using this method allows for AWS to manage and rotate our
    #    authorization keys. This is great because it dramatically shrinks our security risk footprint by reducing the
    #    potential for our AWS credentials to be exposed or mishandled. AWS automatically generates these keys for us,
    #    and they are created on a per-application basis.
    #
    # 2. User Managed IAM Based Role - This method relies on us to generate the keys needed for our user to enact
    # the policies assigned to them. This means that we are responsible for the management of these keys. We used this in
    # our solution because there are extra configurations needed to ensure that AWS-managed keys are passed along to the
    # Docker containers.
    #
    ##
    
    # Main usage for the try-catch block here is for debugging purposes, and we spent close to four hours attempting
    # to understand why the signature generated by Amazon differed from the signature generated in this try-catch block.
    
    # Important!!! If your S3 bucket is encrypted, then the AWS User created to deal with these actions (get, put, delete, etc.)
    # requires additional policy actions related to KMS (Key Management System). This user requires the ability to both generate
    # new keys as well as utilize these keys in crypto operations. Also, Amazon recommends s3v4 be used for the sig vers.
    try:
        s3_client = boto3.client(
            's3',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version='s3v4')
        )
        
        presigned_url = s3_client.generate_presigned_url(
            'put_object', # Only allows for the upload to the bucket.
            Params={'Bucket': bucket_name, 'Key': object_key, 'ContentType': 'application/octet-stream'},
            ExpiresIn=1  # URL valid for 1 second. This is used to ensure that there is enough time for file upload,
            # but attempts to bar the usage of the upload link outside of file upload by the frontend.
        )
        
        # Return to the frontend JSON data for the presigned upload URL 
        # along with a message for me to console log.
        return JsonResponse({
            'url': presigned_url, # Returns the URL for processing by frontend.
            'message': 'Presigned URL generated successfully.'
        }, status=status.HTTP_200_OK)
    
    # Handle HTTP errors gracefully and return to me an error on what went wrong.
    except ClientError as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        return JsonResponse({'error': 'An unexpected error occurred: {}'.format(str(e))}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# The file is updated only after the file size is verified.
# By update, we mean the DB's existing data fields should be
# populated by data recieved from the frontend.
@api_view(['POST'])
@permission_classes([AllowAny])
def update_file(request, main_id, sub_id):
    try:
        secure_file = SecureFileUpload.objects.get(main_id=main_id)
        secure_file.file_name = request.data.get('fileName')
        secure_file.file_size = request.data.get('fileSize')
        secure_file.save()
        saved_data = {
            'id': secure_file.main_id,
            'subId': secure_file.sub_id,
            'fileSize': secure_file.file_size,
            'created': secure_file.created_at.isoformat(),
            'fileName': secure_file.file_name,
        }
        return Response({'message': 'File updated successfully', 
        'Updated Data: ': saved_data}, status=status.HTTP_200_OK)
        
    except SecureFileUpload.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
# We check the file upload on the frontend first here to ensure it's actually
# under, or equal to, 5 MB.
@api_view(['GET'])
@permission_classes([AllowAny])
def file_limits(request):
    
    # Grab allowed max file size, the number of files one can upload,
    # and expiration time as a JSON object.
    data = {
        'expiresInMinutes': 60,
        'fileNumber': 1,
        'totalFileSizeMb': 5,
    }
    try:
        response = data
        return JsonResponse(data)
    
    except Exception as e:
        logger.error(f"\n\n\n == FILE METADATA ERROR ==\n\n\nFailed to send file limits to frontend: {str(e)}\n\n\n")
        return JsonResponse({'error': f"Failed to send file limits to frontend: {str(e)}"}, status=500)

# Similar to the upload link generated earlier, but sets action to get_object
# with expiration time set for max time allowed for data to exist in the
# S3 bucket: (1 Day).
@api_view(['GET'])
@permission_classes([AllowAny])  # Update permissions as needed
def generate_download_link(request, main_id, sub_id):
    try:
        object_key = f"{main_id}{sub_id}"
        bucket_name = settings.AWS_S3_BUCKET_NAME
        s3_client = boto3.client(
            's3',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version='s3v4')
        )

        # Generate a presigned URL for downloading the file
        presigned_url = s3_client.generate_presigned_url('get_object', Params={
            'Bucket': bucket_name,
            'Key': object_key,
        }, ExpiresIn=86400) # This equates to 1 Day in seconds.

        return JsonResponse({'url': presigned_url}, status=status.HTTP_200_OK)

    except ClientError as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
