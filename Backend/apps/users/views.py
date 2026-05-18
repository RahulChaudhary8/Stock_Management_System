import email
import random
from urllib import request
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate
from rest_framework import status
from .models import User
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
# from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from rest_framework.decorators import api_view
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminOrManager
from datetime import timedelta
from rest_framework import viewsets
from .models import SecuritySetting
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from django_ratelimit.decorators import ratelimit
from user_agents import parse




def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminOrManager])
def all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "message": "User registered successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        {
            "errors": serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(['POST'])
@ratelimit(key='ip', rate='30/m', block=True)
def send_register_otp(request):
    email = request.data.get('email')

    if not email:
        return Response({"error": "Email is required"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    otp = str(random.randint(100000, 999999))

    request.session['register_otp'] = make_password(otp)
    request.session['register_data'] = {
        
        "username": request.data.get("username"),
        "first_name": request.data.get("first_name"),
        "last_name": request.data.get("last_name"),
        "email": email,
        "password": request.data.get("password"),
        "role": request.data.get("role"),
    }
    request.session.modified = True
    request.session.save()

    print("SESSION KEY:", request.session.session_key)

    subject = "Account Verification OTP"

    html_content = f"""
    <div style="font-family:Arial;background:#f4f4f7;padding:30px">
        <div style="max-width:500px;margin:auto;background:#fff;padding:30px;border-radius:12px;text-align:center">
            <h2>Verify Your Account</h2>
            <p>Your OTP is:</p>
            <h1 style="color:#7a58d1;letter-spacing:5px">{otp}</h1>
            <p>This OTP is valid for 10 minutes</p>
        </div>
    </div>
    """

    text_content = strip_tags(html_content)

    email_msg = EmailMultiAlternatives(
        subject,
        text_content,
        "yourproject@gmail.com",
        [email]
    )

    email_msg.attach_alternative(html_content, "text/html")
    email_msg.send()

    return Response({"message": "OTP sent"})

@api_view(['POST'])
def verify_register_otp(request):
    otp = request.data.get('otp')

    if not otp:
        return Response(
            {"error": "OTP is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    stored_otp = request.session.get('register_otp')
    register_data = request.session.get('register_data')

    print("Entered OTP:", otp)
    print("Stored OTP:", stored_otp)
    print("Register Data:", register_data)

    if not stored_otp or not register_data:
        return Response(
            {"error": "OTP session expired"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not check_password(otp, stored_otp):
        return Response(
            {
                "error": "Invalid OTP",
                "entered": otp,
                "stored": stored_otp
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = RegisterSerializer(data=register_data)

    if serializer.is_valid():
        serializer.save()

        del request.session['register_otp']
        del request.session['register_data']

        return Response(
            {"message": "Registration successful"},
            status=status.HTTP_201_CREATED
        )

    return Response(
        {
            "serializer_errors": serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )
   


@api_view(['POST'])
@ratelimit(key='ip', rate='30/m', block=True)
def login(request):

    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    # FIND USER
    try:
        user_obj = User.objects.get(username=username)

        # ACCOUNT LOCK CHECK
        if (
            user_obj.account_locked_until and
            timezone.now() < user_obj.account_locked_until
        ):
            return Response(
                {
                    "error": "Account locked for 15 minutes"
                },
                status=403
            )

    except User.DoesNotExist:
        return Response(
            {"error": "Invalid credentials"},
            status=401
        )

    # AUTHENTICATE
    user = authenticate(
        username=username,
        password=password
    )

    # INVALID LOGIN
    if user is None:

        user_obj.failed_login_attempts += 1

        # LOCK ACCOUNT
        if user_obj.failed_login_attempts >= 5:
            user_obj.account_locked_until = (
                timezone.now() + timedelta(minutes=15)
            )

        user_obj.save()

        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # RESET FAILED ATTEMPTS
    user.failed_login_attempts = 0
    user.account_locked_until = None


     # DEVICE + IP TRACKING
    user_agent = request.META.get('HTTP_USER_AGENT')
    ip = request.META.get('REMOTE_ADDR')

    device = parse(user_agent)

    user.last_login_ip = ip
    user.last_login_device = (
        f"{device.browser.family} - {device.os.family}"
    )

    user.last_login = timezone.now()

    user.save()

    return Response(
        {
            "message": "Login successful",
            "tokens": get_tokens_for_user(user),
            "device": user.last_login_device,
            "ip": user.last_login_ip
        },
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
@ratelimit(key='ip', rate='30/m', block=True)
def forgot_password(request):
    email = request.data.get('email')

    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)

        otp = str(random.randint(100000, 999999))
        user.otp = make_password(otp)
        user.otp_created_at = timezone.now()
        user.otp_verified = False
        user.save()

        subject = "Password Reset OTP"

        html_content = f"""
        <div style="font-family:Arial;background:#f4f4f7;padding:30px">
            <div style="max-width:500px;margin:auto;background:#fff;padding:30px;border-radius:12px;text-align:center">
                <h2>Password Reset</h2>
                <p>Your OTP is:</p>
                <h1 style="color:#7a58d1;letter-spacing:5px">{otp}</h1>
                <p>Do not share this OTP</p>
            </div>
        </div>
        """

        text_content = strip_tags(html_content)

        email_msg = EmailMultiAlternatives(
            subject,
            text_content,
            "yourproject@gmail.com",
            [email]
        )

        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()

        return Response({"message": "OTP sent"})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)



@api_view(['POST'])
def verify_forgot_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    try:
        user = User.objects.get(email=email)

        if not user.otp_created_at:
            return Response({"error": "OTP expired"}, status=400)

        if timezone.now() > user.otp_created_at + timedelta(minutes=10):
            return Response({"error": "OTP expired"}, status=400)

        if check_password(otp, user.otp):
            user.otp_verified = True
            user.save()
            return Response({"message": "OTP verified"})

        return Response({"error": "Invalid OTP"}, status=400)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    

@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not email or not otp:
        return Response({"error": "Email & OTP required"}, status=400)

    if new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    try:
        user = User.objects.get(email=email)

        if not check_password(otp, user.otp):
            return Response({"error": "Invalid OTP"}, status=400)

        if not user.otp_verified:
            return Response({"error": "OTP not verified"}, status=400)

        user.set_password(new_password)
        user.otp = None
        user.otp_verified = False
        user.otp_created_at = None
        user.save()

        return Response({"message": "Password reset successful"})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    if not email or not otp:
        return Response(
            {"error": "Email and OTP required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        if check_password(otp, user.otp):
            user.otp_verified = True
            user.save()
            return Response({"message": "OTP verified"})

        return Response({"error": "Invalid OTP"})

    except User.DoesNotExist:
        return Response({"error": "User not found"})


from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user

    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not old_password or not new_password or not confirm_password:
        return Response({"error": "All fields required"}, status=400)

    if not user.check_password(old_password):
        return Response({"error": "Old password incorrect"}, status=400)

    if new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    user.set_password(new_password)
    user.save()

   # ✅ Purana refresh token blacklist karo
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass

    return Response({"message": "Password changed successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get("refresh")

    if not refresh_token:
        return Response(
            {"error": "Refresh token required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response(
            {"message": "Logout successful"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print("Logout error:", str(e))
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )



@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='30/m', block=True)
def edit_profile(request):
    user = request.user

    if user.is_anonymous:
        return Response({"error": "Unauthorized"}, status=401)

    # GET PROFILE
    if request.method == "GET":
        return Response({
            "name": user.first_name + " " + user.last_name,
            "email": user.email,
            "phone": user.phone,
            "bio": user.bio,
            "darkMode": user.dark_mode,
            "profile_image": request.build_absolute_uri(user.profile_image.url)
            if user.profile_image else None
        })

    # UPDATE PROFILE
    if request.method == "PUT":
        phone = request.data.get("phone")
        bio = request.data.get("bio")
        dark_mode = request.data.get("darkMode")
        profile_image = request.FILES.get("profile_image")
        remove_image = request.data.get("remove_image")

        if phone is not None:
            user.phone = phone

        if bio is not None:
            user.bio = bio

        if dark_mode is not None:
            user.dark_mode = str(dark_mode).lower() == "true"

        if profile_image:
            user.profile_image = profile_image
        if str(remove_image).lower() == "true":
            user.profile_image.delete(save=False)
            user.profile_image = None
        user.save()

        return Response({
            "message": "Profile updated successfully",
        })
    


class SecuritySettingViewSet(viewsets.ModelViewSet):
    serializer_class = SecuritySettingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        obj, created = SecuritySetting.objects.get_or_create(
            user=self.request.user
        )
        return SecuritySetting.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)