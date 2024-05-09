# Secure File Transfer

## Overview
Secure File Transfer is a web application designed to securely encrypt, transfer, and decrypt files using modern cryptographic techniques. This project utilizes end-to-end encryption to ensure that files remain confidential and integral from the moment they are uploaded until they are downloaded and decrypted by the intended recipient.

## Features
- **File Encryption**: Files are encrypted client-side using the XChaCha20-Poly1305 algorithm before being uploaded.
- **Secure File Upload and Download**: Files are transferred via presigned URLs generated by AWS S3, ensuring that files are never exposed to unauthorized users.
- **Dynamic Decryption**: Files are decrypted client-side, ensuring that the decryption keys never leave the user's environment.
- **Responsive Design**: Designed to work on both desktop and mobile browsers.

## Technologies Used
- **Frontend**: React, js-cookie, React Router
- **Backend**: Django, Django REST Framework
- **Cryptography**: libsodium-wrappers for encryption and decryption
- **Storage**: AWS S3 for file storage with presigned URLs
- **Deployment**: Docker
- **Web Server**: NGINX

## Installation Instructions
To get the project running on your local machine, follow these steps:
```bash
cd backend
pip install -r requirements.txt
```

Set the following environment variables:
```bash
DEBUG=1
SECRET_KEY='your-secret-key'
AWS_ACCESS_KEY_ID='your-aws-access-key'
AWS_SECRET_ACCESS_KEY='your-aws-secret-key'
AWS_STORAGE_BUCKET_NAME='your-s3-bucket-name'
```

Run the backend server:
```bash
python manage.py migrate
python manage.py runserver
```

Change to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

## How to Use
To use the application, navigate to the local development server's address provided by the output of 'npm start'. From there, you can upload files to be securely stored and later download them after authentication and decryption processes.
