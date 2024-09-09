from ..models import User
from ..serializers import UserRegistrationSerializer

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from ..docs.decorators import user_register_swagger_schema


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["email"] = user.email
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@user_register_swagger_schema()
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        first_name = serializer.validated_data["first_name"]
        last_name = serializer.validated_data["last_name"]
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        username = f"{first_name.lower()}.{last_name.lower()}"
        num = 1
        while User.objects.filter(username=username).exists():
            username = f"{first_name.lower()}.{last_name.lower()}.{num}"
            num += 1

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not email or not password or not first_name or not last_name:
            return Response(
                {"error": "Please provide all fields"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
        )
        return Response({
            "message": "User created successfully"
        }, status=status.HTTP_201_CREATED)

    if serializer.errors["email"][0]:
        return Response(
            {"error": serializer.errors["email"][0]}, status=status.HTTP_400_BAD_REQUEST
        )

    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)