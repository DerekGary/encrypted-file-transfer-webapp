# encrypted-file-transfer/backend/core/crypto_utils.py

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding as sym_padding
from cryptography.hazmat.backends import default_backend
import os

def generate_key_iv():
    """
    Generates a new AES-256 key and IV.
    """
    key = os.urandom(32)  # AES-256 key
    iv = os.urandom(16)  # AES block size is 128 bits
    return key, iv

def encrypt_aes(data, key, iv):
    """
    Encrypts data using AES-256-CBC.
    """
    padder = sym_padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    return encryptor.update(padded_data) + encryptor.finalize()

def decrypt_aes(data, key, iv):
    """
    Decrypts data using AES-256-CBC.
    """
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(data) + decryptor.finalize()
    unpadder = sym_padding.PKCS7(128).unpadder()
    return unpadder.update(decrypted_data) + unpadder.finalize()