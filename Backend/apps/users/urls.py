from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import *

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register),
    path('login/', login),

    # Password reset flow
    path('forgot-password/', forgot_password),
    path('verify-forgot-otp/', verify_forgot_otp),
    path('reset-password/', reset_password),

    path('change-password/', change_password),

    # OTP register flow
    path('send-register-otp/', send_register_otp),
    path('verify-register-otp/', verify_register_otp),

    # Profile
    path('edit-profile/', edit_profile),

    # Auth
    path('logout/', logout),

    path('all-users/', all_users),
]

