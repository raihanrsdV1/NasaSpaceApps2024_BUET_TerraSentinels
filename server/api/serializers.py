from .models import *
from rest_framework import serializers




class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone_no = serializers.CharField(required=True)
    location_lat = serializers.FloatField(required=True)
    location_lon = serializers.FloatField(required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'phone_no', 'location_lat', 'location_lon']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user




class PostSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True)  # Use tag IDs for writing
    tag_names = serializers.SerializerMethodField(read_only=True)  # Use tag names for reading

    class Meta:
        model = Post
        fields = ['id', 'user', 'title', 'content', 'created_at', 'tags', 'tag_names']  # Include both tag IDs and names

    def get_tag_names(self, obj):
        return [tag.name for tag in obj.tags.all()]  # Return tag names


# Comment Serializer
class CommentSerializer(serializers.ModelSerializer):
    ratings = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'post', 'user', 'created_at', 'ratings', 'parent_comment']

    def get_ratings(self, obj):
        ratings = obj.ratings.all()  # Access the 'ratings' related_name from CommentRating
        return CommentRatingSerializer(ratings, many=True).data  # Serialize the ratings


# Alert Serializer
class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'





class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'



class CommentRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentRating
        fields = ['id', 'user', 'value']  # Fields to include in the response


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['user', 'post', 'upvote', 'rated_at']




class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = '__all__'

class DiseaseStatisticsSerializer(serializers.ModelSerializer):
    symptoms = SymptomSerializer(many=True, read_only=True)
    
    class Meta:
        model = DiseaseStatistics
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'



