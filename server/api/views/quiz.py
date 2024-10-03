from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import *
from ..serializers import *
from .community_helper import *
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.db.models import F, ExpressionWrapper, DurationField, Count, Sum, Min, Case, When, Q
from django.db.models import Prefetch


# Create a Topic
@api_view(['POST'])
def create_topic(request):
    serializer = TopicSerializer(data=request.data)
    if serializer.is_valid():
        topic = serializer.save()
        return Response({"message": "Topic created successfully.", "topic": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Edit a Topic
@api_view(['PUT'])
def edit_topic(request, pk):
    try:
        topic = Topic.objects.get(pk=pk)
    except Topic.DoesNotExist:
        return Response({"error": "Topic not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = TopicSerializer(instance=topic, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Topic updated successfully.", "topic": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete a Topic
@api_view(['DELETE'])
def delete_topic(request, pk):
    try:
        topic = Topic.objects.get(pk=pk)
        topic.delete()
        return Response({"message": "Topic deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Topic.DoesNotExist:
        return Response({"error": "Topic not found."}, status=status.HTTP_404_NOT_FOUND)

# Create a Blog
@api_view(['POST'])
def create_blog(request):
    serializer = BlogSerializer(data=request.data)
    if serializer.is_valid():
        blog = serializer.save()
        return Response({"message": "Blog created successfully.", "blog": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Edit a Blog
@api_view(['PUT'])
def edit_blog(request, pk):
    try:
        blog = Blog.objects.get(pk=pk)
    except Blog.DoesNotExist:
        return Response({"error": "Blog not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = BlogSerializer(instance=blog, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Blog updated successfully.", "blog": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete a Blog
@api_view(['DELETE'])
def delete_blog(request, pk):
    try:
        blog = Blog.objects.get(pk=pk)
        blog.delete()
        return Response({"message": "Blog deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Blog.DoesNotExist:
        return Response({"error": "Blog not found."}, status=status.HTTP_404_NOT_FOUND)
    


@api_view(['GET'])
def get_all_topics(request):
    topics = Topic.objects.all()  # Fetch all topics
    serializer = TopicSerializer(topics, many=True)  # Serialize the topics
    return Response(serializer.data, status=status.HTTP_200_OK)

# Endpoint to get all blogs
@api_view(['GET'])
def get_all_blogs(request):
    blogs = Blog.objects.all()  # Fetch all blogs
    serializer = BlogSerializer(blogs, many=True)  # Serialize the blogs
    return Response(serializer.data, status=status.HTTP_200_OK)





@api_view(['GET', 'POST'])
def quiz_list(request):
    """
    List all quizzes or create a new quiz.
    """
    if request.method == 'GET':
        quizzes = Quiz.objects.all()
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = QuizSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def quiz_detail(request, pk):
    """
    Retrieve, update or delete a quiz by its ID.
    """
    try:
        quiz = Quiz.objects.get(pk=pk)
    except Quiz.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = QuizSerializer(quiz, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        quiz.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def add_correct_option(request, quiz_id):
    """
    Add a correct option to a quiz.
    """
    try:
        quiz = Quiz.objects.get(pk=quiz_id)
    except Quiz.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    correct_option_id = request.data.get('correct_answer')
    try:
        correct_option = Option.objects.get(pk=correct_option_id, quiz=quiz)
        quiz.correct_answer = correct_option
        quiz.save()
        return Response({'message': 'Correct option added successfully!'}, status=status.HTTP_200_OK)
    except Option.DoesNotExist:
        return Response({'error': 'Invalid option ID.'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def start_quiz(request):
    user_id = request.data.get('user_id')  # Get the user ID from the request
    quiz_id = request.data.get('quiz_id')  # Get the quiz ID from the request

    # Create a new QuizSolve instance
    quiz = get_object_or_404(Quiz, id=quiz_id)

    # Get the user object
    user = get_object_or_404(User, id=user_id)

    quiz_solve_data = {
        'user': user_id,  # Pass the user ID directly
        'quiz': quiz_id,  # Pass the quiz ID directly
    }

    # Serialize the data and save the instance
    serializer = QuizSolveSerializer(data=quiz_solve_data)

    if serializer.is_valid():
        serializer.save()  # This will create the QuizSolve instance
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        print(serializer.errors)  # Print the errors for debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    

"""
{
    "user_id": 1,
    "quiz_id": 1
}

"""

    


@api_view(['POST'])
def end_quiz(request):
    user = request.data.get('user_id')  # Assuming the user is authenticated
    quiz_solve_id = request.data.get('quiz_solve_id')
    chosen_option_id = request.data.get('chosen_option')
    print(request.data)
    print(user, quiz_solve_id, chosen_option_id)

    # Fetch the QuizSolve instance
    quiz_solve = get_object_or_404(QuizSolve, id=quiz_solve_id, user=user)

    # Fetch the chosen option
    chosen_option = get_object_or_404(Option, id=chosen_option_id)

    # Update the QuizSolve instance with the chosen option and end time
    quiz_solve.chosen_option = chosen_option
    quiz_solve.quiz_time_end = datetime.now()  # Set the current time as the end time
    quiz_solve.save()  # Save the updated instance

    # Check if the chosen option is the correct answer for the quiz
    is_correct = False
    if quiz_solve.quiz.correct_answer and quiz_solve.quiz.correct_answer == chosen_option:
        is_correct = True

    # Serialize and return the updated data, along with the correctness of the answer
    serializer = QuizSolveSerializer(quiz_solve)
    response_data = serializer.data
    response_data['correct'] = is_correct  # Add the 'correct' field to the response

    return Response(response_data, status=status.HTTP_200_OK)

"""
{
    "user_id": 1,
    "quiz_solve_id": 1,
    "chosen_option": 2
}

"""


@api_view(['GET'])
def get_quiz_leaderboard(request, quiz_id):
    # Get the quiz instance
    quiz = get_object_or_404(Quiz, id=quiz_id)

    # Step 1: Get all QuizSolve attempts where the answer is correct
    correct_attempts = QuizSolve.objects.filter(
        quiz=quiz,
        chosen_option=F('quiz__correct_answer'),  # Correct answer
        quiz_time_end__isnull=False  # Quiz is completed
    ).annotate(
        # Step 2: Calculate time taken for the quiz (from start to end)
        time_interval=ExpressionWrapper(F('quiz_time_end') - F('quiz_taking_start'), output_field=DurationField())
    ).annotate(
        # Step 3: Count total correct attempts per user
        num_attempts=Count('id'),
        # Step 4: Get the time interval (for sorting)
        shortest_time=F('time_interval'),
        first_end_time=F('quiz_time_end')  # Store the earliest quiz end time
    ).order_by(
        'num_attempts',     # Sort by least number of attempts first
        'shortest_time',    # Sort by shortest solving time second
        'first_end_time'    # Sort by earliest finish time third
    )

    # Step 5: Serialize the leaderboard results
    serializer = QuizSolveSerializer(correct_attempts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)





@api_view(['GET'])
def get_global_leaderboard(request):
    # Step 1: Get all QuizSolve attempts where quiz is completed
    all_attempts = QuizSolve.objects.filter(quiz_time_end__isnull=False)

    # Step 2: Annotate to determine correct answers
    leaderboard = all_attempts.annotate(
        is_correct=Case(
            When(chosen_option=F('quiz__correct_answer'), then=1),
            default=0,
            output_field=models.IntegerField(),
        )
    ).values(
        'user'
    ).annotate(
        # Count total correct solves for each user
        correct_solved=Count('id', filter=Q(is_correct=1)),
        
        # Calculate total time spent (from start to end) for each attempt
        total_time=Sum(
            ExpressionWrapper(F('quiz_time_end') - F('quiz_taking_start'), output_field=DurationField())
        ),

        # Calculate cumulative time per user across all correct attempts
        cumulative_time=Sum(
            ExpressionWrapper(F('quiz_time_end') - F('quiz_taking_start'), output_field=DurationField()),
            filter=Q(is_correct=1)  # Only include correct answers
        ),

        # Get the earliest end time for the user's attempts
        earliest_end_time=Min('quiz_time_end')
    ).filter(correct_solved__gt=0)  # Only keep users with correct solves

    # Fetch user info for each user in the leaderboard
    leaderboard_with_user_info = leaderboard.annotate(
        username=F('user__username'),
        first_name=F('user__first_name'),
        last_name=F('user__last_name'),
        email=F('user__email')
    ).order_by(
        '-correct_solved',     # Sort by most correct quizzes solved
        'cumulative_time',     # Sort by shortest cumulative time
        'earliest_end_time'    # Sort by earliest finish time
    )

    return Response(list(leaderboard_with_user_info), status=200)




@api_view(['GET'])
def get_quizzes_by_topic(request):
    topic_id = request.GET.get('topic')  # Get the topic ID from the query parameters

    if not topic_id:
        return Response({"error": "Topic ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Retrieve quizzes for the specified topic
        quizzes = Quiz.objects.filter(topic_id=topic_id)
        serializer = QuizSerializer(quizzes, many=True)  # Serialize the quizzes
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    



@api_view(['GET'])
def get_blogs_by_topic(request, topic_id):
    """
    Fetch all blogs related to a specific topic.
    """
    blogs = Blog.objects.filter(topic_id=topic_id)  # Fetch blogs by topic ID

    if not blogs.exists():
        return Response({"message": "No blogs found for this topic."}, status=status.HTTP_404_NOT_FOUND)

    serializer = BlogSerializer(blogs, many=True)  # Serialize the blog objects
    return Response(serializer.data, status=status.HTTP_200_OK)