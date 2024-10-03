from django.urls import path
from .views.auth_view import MyTokenObtainPairView, register
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views.demo_view import hello
from .views.community import *
from .views.weather_data import *
from .views.quiz import *
from .views.water_resource_data import get_water_data

urlpatterns = [
    # auth
    path("token/", MyTokenObtainPairView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("register/", register, name="register"),
    
    # demo
    path("hello/", hello),
    
    # water data
    path("water-data/", get_water_data),
    
    # weather data
    path("weather-data/<str:parameter>/<str:start>/<str:end>/<str:long>/<str:lat>/", get_weather_data),

    #  community
    path('post/', post_community, name='post_community'),  # Create a post
    path('post/<int:post_id>/', get_post, name='get_post'),  # Get a post by ID
    path('comment/', post_comment, name='post_comment'),  # Add a comment to a post
    path('comments/<int:post_id>/', get_comments, name='get_comments'),  # Get comments of a post
    path('alert/<int:alert_id>/', get_alert, name='get_alert'),  # Get an alert by ID
    path('tags/', get_all_tags, name='get_all_tags'),  # GET: List all tags
    path('tags/<int:id>/', get_tag_by_id, name='get_tag_by_id'),  # GET: Get tag by ID
    path('tags/create/', create_tag, name='create_tag'),  # POST: Create a new tag
    path('comment_ratings/add/', add_comment_rating, name='add_comment_rating'),
    path('comment_ratings/undo/', undo_comment_rating, name='undo_comment_rating'),
    path('comment_ratings/delete/<int:id>/', delete_comment_rating, name='delete_comment_rating'),

    # Post URLs
    path('post/delete/<int:post_id>/', delete_post, name='delete_post'),
    path('post/edit/<int:post_id>/', edit_post, name='edit_post'),
    path('post_ratings/add/', add_or_update_post_rating, name='add_or_update_post_rating'),
    path('post_ratings/delete/', delete_post_rating, name='delete_post_rating'),
    path('post/all/', get_all_posts, name='get_all_posts'),
    
    # Comment URLs
    path('comment/delete/<int:comment_id>/', delete_comment, name='delete_comment'),
    path('comment/edit/<int:comment_id>/', edit_comment, name='edit_comment'),
    
    # Tag URLs
    path('tag/delete/<int:tag_id>/', delete_tag, name='delete_tag'),
    path('tag/edit/<int:tag_id>/', edit_tag, name='edit_tag'),
    
    # Alert URLs
    path('alert/delete/<int:alert_id>/', delete_alert, name='delete_alert'),
    path('alert/edit/<int:alert_id>/', edit_alert, name='edit_alert'),
    path('alert/', add_alert, name='add_alert'),
    path('alert/all/', get_all_alerts, name='get_all_alerts'),

    # Disease Statistics
    path('disease-statistics/', add_disease_statistics, name='add_disease_statistics'),
    path('disease-statistics/<int:ds_id>/edit/', edit_disease_statistics, name='edit_disease_statistics'),
    path('disease-statistics/<int:ds_id>/delete/', delete_disease_statistics, name='delete_disease_statistics'),
    
    path('symptom/', add_symptom, name='add_symptom'),
    path('symptom/<int:symptom_id>/edit/', edit_symptom, name='edit_symptom'),
    path('symptom/<int:symptom_id>/delete/', delete_symptom, name='delete_symptom'),

    path('disease-statistics/all/', get_all_disease_statistics, name='get_all_disease_statistics'),

    path('symptoms/all/', get_all_symptoms, name='get_all_symptoms'),


    path('posts/filter/', filter_posts, name='post-filter'),
    path('posts/date-range/', post_date_range, name='post-date-range'),


    # Topic URLs
    path('topics/', create_topic, name='create_topic'),  # Create Topic
    path('topics/<int:pk>/', edit_topic, name='edit_topic'),  # Edit Topic
    path('topics/<int:pk>/delete/', delete_topic, name='delete_topic'),  # Delete Topic
    
    # Blog URLs
    path('blogs/', create_blog, name='create_blog'),  # Create Blog
    path('blogs/<int:pk>/', edit_blog, name='edit_blog'),  # Edit Blog
    path('blogs/<int:pk>/delete/', delete_blog, name='delete_blog'),  # Delete Blog

    path('topics/all/', get_all_topics, name='get_all_topics'),  # Endpoint to get all topics
    path('blogs/all/', get_all_blogs, name='get_all_blogs'),    # Endpoint to get all blogs

    path('quizzes/', quiz_list, name='quiz-list'),
    path('quizzes/<int:pk>/', quiz_detail, name='quiz-detail'),
    path('quizzes/<int:quiz_id>/add-correct-option/', add_correct_option, name='add-correct-option'),

    path('quiz/start/', start_quiz, name='start-quiz'),  # Start quiz URL
    path('quiz/end/', end_quiz, name='end-quiz'),        # End quiz URL

    path('quiz/<int:quiz_id>/leaderboard/', get_quiz_leaderboard, name='quiz-leaderboard'),
    path('quiz/leaderboard/global/', get_global_leaderboard, name='global_leaderboard'),
    path('post/<int:post_id>/add-image/', add_image_to_post, name='add-image-to-post'),
    path('api/quizzes/', get_quizzes_by_topic, name='get_quizzes_by_topic'),
    path('notifications/<int:user_id>/', get_user_notifications, name='user-notifications'),
    path('notifications/add/', add_notification, name='add-notification'),
    path('blogs/topic/<int:topic_id>/', get_blogs_by_topic, name='get_blogs_by_topic'),
    # Add other URLs here...
]
