# Authors: Derek Gary, Takaiya Jones

from django.db import models
from django.utils import timezone
import datetime
from uuid import uuid4

# This indicates our SecureFileUpload DB object.
# Everything, other than created_at and file_size,
# is cryptographically secure in some way.
class SecureFileUpload(models.Model):
    main_id = models.CharField(max_length=24, primary_key=True, editable=False)
    sub_id = models.CharField(max_length=32, unique=True)
    file_size = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return str(self.main_id)