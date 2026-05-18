from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
    )

    phone = models.CharField(max_length=15, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    dark_mode = models.BooleanField(default=False)
    profile_image = models.ImageField(
        upload_to="profile/",
        blank=True,
        null=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='staff'
    )

    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_verified = models.BooleanField(default=False)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_device = models.TextField(blank=True, null=True)
    failed_login_attempts = models.IntegerField(default=0)
    account_locked_until = models.DateTimeField(blank=True, null=True)

    def otp_expired(self):
        if not self.otp_created_at:
            return True
        return timezone.now() > self.otp_created_at + timedelta(minutes=10)

    def __str__(self):
        return self.username
    


class SecuritySetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    login_alerts = models.BooleanField(default=True)
    two_factor_auth = models.BooleanField(default=False)
    block_suspicious_logins = models.BooleanField(default=True)
    save_devices = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["updated_at"])
        ]

    def __str__(self):
        return f"{self.user.username} Security Settings"


class AuditLog(models.Model):
    ACTIONS = (
        ("LOGIN", "Login"),
        ("LOGOUT", "Logout"),
        ("PASSWORD_CHANGE", "Password Change"),
        ("FAILED_LOGIN", "Failed Login"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=ACTIONS)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["action"]),
        ]