from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Task, User
from ..serializers import TaskSerializer

@api_view(['POST'])
def create_task(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.get(id=request.data["user"])  # Ensure the user exists
        serializer.save(user=user)  # Automatically assign the current user
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['DELETE'])
def delete_task(request, task_id):
    try:
        task = Task.objects.get(id=task_id)  # Ensure the task belongs to the logged-in user
    except Task.DoesNotExist:
        return Response({'error': 'Task not found or not owned by user.'}, status=status.HTTP_404_NOT_FOUND)

    task.delete()
    return Response({'message': 'Task deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)



@api_view(['GET'])
def get_user_tasks(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    tasks = Task.objects.filter(user=user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)