from django.urls import path
from .views.auth_view import MyTokenObtainPairView, register
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views.demo_view import hello
from .views.community import *
from .views.weather_data import *

urlpatterns = [
    # auth
    path("token/", MyTokenObtainPairView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("register/", register, name="register"),
    
    # demo
    path("hello/", hello),
    
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
]
