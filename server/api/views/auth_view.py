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
        first_name = serializer.validated_data['first_name']
        last_name = serializer.validated_data['last_name']
        
        # Generate unique username
        base_username = f"{first_name.lower()}.{last_name.lower()}"
        username = base_username
        num = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{num}"
            num += 1

        # Save the user with latitude, longitude, and phone number
        user = serializer.save(username=username)

        # Serialize the created user to include in the response
        user_data = UserRegistrationSerializer(user).data
        
        return Response({
            "message": "User created successfully",
            "user": user_data,
            "username": username  # Add the determined username to the response
        }, status=status.HTTP_201_CREATED)
    
    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)





