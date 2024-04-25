# encrypted-file-transfer/backend/core/models.py

from django.db import models
from django.utils import timezone
import datetime
from uuid import uuid4
        
class SecureFileUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    sub_id = models.CharField(max_length=32, unique=True)
    file_size = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    file_metadata = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return str(self.id)