from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
def hello(request):
    print("user - ", request.user.id)
    print(type(request.user))
    return Response({"message": "Hello from server."},
                    status=status.HTTP_200_OK)
