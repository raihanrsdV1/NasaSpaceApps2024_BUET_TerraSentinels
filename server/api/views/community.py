from sinch import SinchClient
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import *
from ..serializers import *
from .community_helper import *
from django.utils import timezone
from django.shortcuts import get_object_or_404


@api_view(['POST'])
def post_community(request):
    data = request.data
    serializer = PostSerializer(data=data)

    # Validate the serializer with the data
    if serializer.is_valid():
        serializer.save() 
        return Response({"message": "Post created successfully.", "post": serializer.data},
                        status=status.HTTP_201_CREATED)

    # If the data is invalid, return a 400 response with the errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Get a post by its ID
@api_view(['GET'])
def get_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
def post_comment(request):
    data = request.data
    serializer = CommentSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Comment added successfully.", "comment": serializer.data},
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Get the comments of a post
@api_view(['GET'])
def get_comments(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        comments = post.comments.all()

        # Serialize the comments along with their ratings
        for comment in comments:
            # Retrieve ratings for each comment
            ratings = comment.ratings.all()  # Use the related_name 'ratings'
            comment.comment_ratings = ratings  # Attach the ratings to the comment object

        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)


# Get an alert by its ID
@api_view(['GET'])
def get_alert(request, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id)
        serializer = AlertSerializer(alert)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Alert.DoesNotExist:
        return Response({"error": "Alert not found"}, status=status.HTTP_404_NOT_FOUND)


# create tags
@api_view(['POST'])
def create_tags(request):
    data = request.data
    if isinstance(data, list):
        for tag_name in data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
        return Response({"message": "Tags created successfully."}, status=status.HTTP_201_CREATED)
    return Response({"error": "Invalid data format. Please provide a list of tag names."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_tag(request):
    data = request.data
    serializer = TagSerializer(data=data)

    # Check if the data is valid
    if serializer.is_valid():
        serializer.save()  # Save the new tag
        return Response({"message": "Tag created successfully.", "tag": serializer.data},
                        status=status.HTTP_201_CREATED)

    # Return errors if the data is invalid
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_all_tags(request):
    tags = Tag.objects.all()  # Fetch all tags from the database
    serializer = TagSerializer(tags, many=True)  # Serialize all tags
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_tag_by_id(request, id):
    try:
        tag = Tag.objects.get(id=id)  # Fetch the tag by ID
        serializer = TagSerializer(tag)  # Serialize the tag
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Tag.DoesNotExist:
        return Response({"error": "Tag not found."}, status=status.HTTP_404_NOT_FOUND)


# add a comment rating

@api_view(['POST'])
def add_comment_rating(request):
    user = request.data["user"]  # Assuming user is logged in and identified
    data = request.data

    try:
        comment = Comment.objects.get(id=data['comment_id'])

        # Check if the user already rated the comment
        user = User.objects.get(id=user)
        rating, created = CommentRating.objects.update_or_create(
            user=user,
            comment=comment,
            defaults={'value': data['value']}  # 1 for upvote, -1 for downvote
        )

        if created:
            message = "Comment rating added successfully."
        else:
            message = "Comment rating updated successfully."

        serializer = CommentRatingSerializer(rating)
        return Response({"message": message, "rating": serializer.data}, status=status.HTTP_201_CREATED)

    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
    except KeyError:
        return Response({"error": "Invalid input. 'comment_id' and 'value' are required."}, status=status.HTTP_400_BAD_REQUEST)


# Undo a rating (remove the user's rating from a comment)
@api_view(['DELETE'])
def undo_comment_rating(request):
    user = request.data["user"] 
    data = request.data

    try:
        comment = Comment.objects.get(id=data['comment_id'])
        rating = CommentRating.objects.get(user=user, comment=comment)
        rating.delete()
        return Response({"message": "Comment rating removed successfully."}, status=status.HTTP_200_OK)

    except (Comment.DoesNotExist, CommentRating.DoesNotExist):
        return Response({"error": "Rating or Comment not found."}, status=status.HTTP_404_NOT_FOUND)


# Delete a specific rating by ID
@api_view(['DELETE'])
def delete_comment_rating(request, id):
    try:
        rating = CommentRating.objects.get(id=id)
        rating.delete()
        return Response({"message": "Comment rating deleted successfully."}, status=status.HTTP_200_OK)
    except CommentRating.DoesNotExist:
        return Response({"error": "Comment rating not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_all_posts(request):
    # Retrieve all posts
    posts = Post.objects.all()
    # Serialize the posts using the updated PostSerializer
    serializer = PostSerializer(posts.order_by("-created_at"), many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


# Rate Post
@api_view(['POST'])
def add_or_update_post_rating(request):
    user = request.data["user"]  # Assuming user is authenticated
    data = request.data

    try:
        post = Post.objects.get(id=data['post_id'])

        # Check if the user has already rated the post
        user = User.objects.get(id=user)
        rating, created = Rating.objects.update_or_create(
            user=user,
            post=post,
            # True for upvote, False for downvote
            defaults={'upvote': data['upvote']}
        )

        if created:
            message = "Post rating added successfully."
        else:
            message = "Post rating updated successfully."

        serializer = RatingSerializer(rating)
        return Response({"message": message, "rating": serializer.data}, status=status.HTTP_201_CREATED)

    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    except KeyError:
        return Response({"error": "Invalid input. 'post_id' and 'upvote' are required."}, status=status.HTTP_400_BAD_REQUEST)


# Unrate Post
@api_view(['DELETE'])
def delete_post_rating(request):
    user = request.data["user"]  # Assuming the user is authenticated
    data = request.data

    try:
        post = Post.objects.get(id=data['post_id'])
        user = User.objects.get(id=user)
        rating = Rating.objects.get(user=user, post=post)

        # Delete the rating
        rating.delete()
        return Response({"message": "Post rating removed successfully."}, status=status.HTTP_200_OK)

    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    except Rating.DoesNotExist:
        return Response({"error": "No rating found to delete."}, status=status.HTTP_404_NOT_FOUND)
    except KeyError:
        return Response({"error": "Invalid input. 'post_id' is required."}, status=status.HTTP_400_BAD_REQUEST)


# Delete Post
@api_view(['DELETE'])
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        post.delete()
        return Response({"message": "Post deleted successfully."}, status=status.HTTP_200_OK)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)


# Edit Post
@api_view(['PUT'])
def edit_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        # partial=True allows updating only provided fields
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Post updated successfully.", "post": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)


# Delete Comment
@api_view(['DELETE'])
def delete_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
        comment.delete()
        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_200_OK)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)


# Edit Comment
@api_view(['PUT'])
def edit_comment(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
        serializer = CommentSerializer(
            comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Comment updated successfully.", "comment": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)


# Delete Tag
@api_view(['DELETE'])
def delete_tag(request, tag_id):
    try:
        tag = Tag.objects.get(id=tag_id)
        tag.delete()
        return Response({"message": "Tag deleted successfully."}, status=status.HTTP_200_OK)
    except Tag.DoesNotExist:
        return Response({"error": "Tag not found."}, status=status.HTTP_404_NOT_FOUND)


# Edit Tag
@api_view(['PUT'])
def edit_tag(request, tag_id):
    try:
        tag = Tag.objects.get(id=tag_id)
        serializer = TagSerializer(tag, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Tag updated successfully.", "tag": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Tag.DoesNotExist:
        return Response({"error": "Tag not found."}, status=status.HTTP_404_NOT_FOUND)


def send_sms(to, message):
    sinch_client = SinchClient(
        key_id="BNSB-HPSJC",
        key_secret="TNT-TFSWJDF-LFOBS-UBLB-OBJ",
        project_id="QMVT-MFU-VT-XJO-UIJT-FWFOU-O-HJWF-VT-TPNF-NPOFZ"
    )

    send_batch_response = sinch_client.sms.batches.send(
        body=message,
        to=[to],
        from_="+8801306231965",
        delivery_report="none"
    )

    print(send_batch_response)

# Delete Alert


@api_view(['DELETE'])
def delete_alert(request, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id)
        alert.delete()
        return Response({"message": "Alert deleted successfully."}, status=status.HTTP_200_OK)
    except Alert.DoesNotExist:
        return Response({"error": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)


# Edit Alert
@api_view(['PUT'])
def edit_alert(request, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id)
        serializer = AlertSerializer(alert, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Alert updated successfully.", "alert": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Alert.DoesNotExist:
        return Response({"error": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def add_alert(request):
    data = request.data
    serializer = AlertSerializer(data=data)
    
    if serializer.is_valid():
        alert = serializer.save() 

        # Get users within 50KM radius
        users_nearby = get_users_within_radius(
            alert.alert_location_lat,
            alert.alert_location_lon,
            radius_km=50 
        )

        for user in users_nearby:
            Notification.objects.create(
                user=user,
                content=f"An alert has been created near your location: {
                    alert.post.title}",
                post=alert.post,
                created_at=timezone.now(),
                is_alert=True,
                is_seen=False
            )
            
            send_sms(user.phone_no, f"An alert has been created near your location: {alert.post.title}")
            
        
        return Response({"message": "Alert created and notifications sent.", "alert": serializer.data},
                        status=status.HTTP_201_CREATED)

    # If the data is invalid, return a 400 response with the errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_all_alerts(request):
    alerts = Alert.objects.all()  # Fetch all alerts from the database
    serializer = AlertSerializer(alerts, many=True)  # Serialize all alerts
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_disease_statistics(request):
    data = request.data
    symptoms_data = data.pop('symptoms', [])

    # Ensure all symptoms are in the database
    for symptom_name in symptoms_data:
        symptom, created = Symptom.objects.get_or_create(name=symptom_name)

    # Save disease statistics with associated symptoms
    serializer = DiseaseStatisticsSerializer(data=data)
    if serializer.is_valid():
        disease_stats = serializer.save()
        # Add symptoms to the disease statistics
        for symptom_name in symptoms_data:
            symptom = Symptom.objects.get(name=symptom_name)
            disease_stats.symptoms.add(symptom)
        return Response({"message": "Disease statistics added successfully.", "disease_statistics": serializer.data},
                        status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_disease_statistics(request, ds_id):
    try:
        disease_statistics = DiseaseStatistics.objects.get(id=ds_id)
        data = request.data
        symptoms_data = data.pop('symptoms', [])

        # Ensure all symptoms are in the database
        for symptom_name in symptoms_data:
            symptom, created = Symptom.objects.get_or_create(name=symptom_name)

        serializer = DiseaseStatisticsSerializer(
            disease_statistics, data=data, partial=True)
        if serializer.is_valid():
            updated_ds = serializer.save()
            # Update symptoms for the disease statistics
            updated_ds.symptoms.clear()
            for symptom_name in symptoms_data:
                symptom = Symptom.objects.get(name=symptom_name)
                updated_ds.symptoms.add(symptom)
            return Response({"message": "Disease statistics updated successfully.", "disease_statistics": serializer.data},
                            status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except DiseaseStatistics.DoesNotExist:
        return Response({"error": "Disease statistics not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
def delete_disease_statistics(request, ds_id):
    try:
        disease_statistics = DiseaseStatistics.objects.get(id=ds_id)
        disease_statistics.delete()
        return Response({"message": "Disease statistics deleted successfully."}, status=status.HTTP_200_OK)
    except DiseaseStatistics.DoesNotExist:
        return Response({"error": "Disease statistics not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def add_symptom(request):
    data = request.data
    serializer = SymptomSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Symptom added successfully.", "symptom": serializer.data},
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_symptom(request, symptom_id):
    try:
        symptom = Symptom.objects.get(id=symptom_id)
        serializer = SymptomSerializer(
            symptom, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Symptom updated successfully.", "symptom": serializer.data},
                            status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Symptom.DoesNotExist:
        return Response({"error": "Symptom not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
def delete_symptom(request, symptom_id):
    try:
        symptom = Symptom.objects.get(id=symptom_id)
        symptom.delete()
        return Response({"message": "Symptom deleted successfully."}, status=status.HTTP_200_OK)
    except Symptom.DoesNotExist:
        return Response({"error": "Symptom not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_all_disease_statistics(request):
    disease_statistics = DiseaseStatistics.objects.all()
    serializer = DiseaseStatisticsSerializer(disease_statistics, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_all_symptoms(request):
    symptoms = Symptom.objects.all()
    serializer = SymptomSerializer(symptoms, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def filter_posts(request):
    # Get filter parameters from request
    title = request.GET.get('title', None)
    content = request.GET.get('content', None)
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)
    # Expecting tags as a comma-separated string
    tag_names = request.GET.get('tags', None)
    is_alert = request.GET.get('is_alert', None)

    # Start with all posts
    queryset = Post.objects.all()

    # Substring search in title
    if title:
        queryset = queryset.filter(title__icontains=title)

    # Substring search in content
    if content:
        queryset = queryset.filter(content__icontains=content)

    # Date filtering
    print(start_date)
    print(end_date)
    if start_date and end_date:
        queryset = queryset.filter(created_at__range=[start_date, end_date])
    elif start_date:
        queryset = queryset.filter(created_at__gte=start_date)
    elif end_date:
        queryset = queryset.filter(created_at__lte=end_date)

    # Tag filtering
    if tag_names:
        # Split the comma-separated string into a list
        tag_list = tag_names.split(',')
        tags = Tag.objects.filter(name__in=tag_list)
        queryset = queryset.filter(tags__in=tags).distinct()

    # Check if post is an alert
    if is_alert and is_alert.lower() == 'true':
        queryset = queryset.filter(alert__isnull=False)  # Post is an alert
    elif is_alert and is_alert.lower() == 'false':
        queryset = queryset.filter(alert__isnull=True)  # Post is not an alert

    # Serialize and return the filtered queryset (assuming you have a serializer for Post)
    serializer = PostSerializer(queryset.order_by("-created_at"), many=True)
    return Response(serializer.data)


@api_view(['GET'])
def post_date_range(request):
    try:
        # Query the Post model for the minimum and maximum created_at dates
        oldest_post = Post.objects.earliest('created_at')
        newest_post = Post.objects.latest('created_at')

        # Prepare the response data
        date_range = {
            'oldest_post_date': oldest_post.created_at,
            'newest_post_date': newest_post.created_at,
        }
        return Response(date_range, status=status.HTTP_200_OK)

    except Post.DoesNotExist:
        return Response({'error': 'No posts found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def add_image_to_post(request, post_id):
    # Fetch the post by ID
    post = get_object_or_404(Post, id=post_id)

    # Check if there is any image in the request files
    image = request.FILES.get('image')

    if not image:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    # Create the PostImage instance and associate it with the post
    PostImage.objects.create(post=post, image=image)

    # Return the updated post data with the new image
    serializer = PostSerializer(post)
    return Response({"message": "Image added successfully.", "post": serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_user_notifications(request, user_id):
    try:
        # Filter notifications by user and sort them by 'created_at' from latest to oldest
        notifications = Notification.objects.filter(
            user_id=user_id).order_by('-created_at')

        # Serialize the notifications
        serializer = NotificationSerializer(notifications, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Notification.DoesNotExist:
        return Response({"error": "Notifications not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def add_notification(request):
    # Extract data from the request
    user_id = request.data.get('user')
    content = request.data.get('content')
    post_id = request.data.get('post', None)
    is_seen = request.data.get('is_seen', False)
    is_alert = request.data.get('is_alert', False)

    try:
        # Fetch the user and post (if provided)
        user = User.objects.get(id=user_id)
        post = Post.objects.get(id=post_id) if post_id else None

        # Create the notification
        notification = Notification.objects.create(
            user=user,
            content=content,
            post=post,
            is_seen=is_seen,
            is_alert=is_alert
        )

        # Serialize the newly created notification
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    except Post.DoesNotExist:
        return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PATCH'])
def mark_as_answered(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update the is_answered field to True
    post.is_answered = True
    post.save()

    # Return the updated post using the existing PostSerializer
    serializer = PostSerializer(post)
    return Response(serializer.data, status=status.HTTP_200_OK)
