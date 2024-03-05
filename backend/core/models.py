from django.db import models
import uuid

class EncryptedFile(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    key = models.BinaryField()
    iv = models.BinaryField()
