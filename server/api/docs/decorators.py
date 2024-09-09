from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from ..serializers import UserRegistrationSerializer


def user_register_swagger_schema():
    return swagger_auto_schema(
        method='post',
        request_body=UserRegistrationSerializer,
        responses={200: 'Success', 400: 'Bad Request'},
        operation_summary='User Registration',
        operation_description='Register a new user.',
        security=[],
        tags=['Authentication'],
    )
