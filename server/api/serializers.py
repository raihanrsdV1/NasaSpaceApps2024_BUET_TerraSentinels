from .models import *
from rest_framework import serializers
from django.utils.timesince import timesince
from django.utils import timezone




class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone_no = serializers.CharField(required=True)
    location_lat = serializers.FloatField(required=True)
    location_lon = serializers.FloatField(required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'phone_no', 'location_lat', 'location_lon', 'username']

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
    upvotes_count = serializers.SerializerMethodField()  # Count of upvotes
    downvotes_count = serializers.SerializerMethodField()  # Count of downvotes
    user_info = UserRegistrationSerializer(source='user')  # Include user information

    class Meta:
        model = Post
        fields = ['id', 'user', 'user_info', 'title', 'content', 'created_at', 'tags', 'tag_names', 'is_question', 'is_answered', 'upvotes_count', 'downvotes_count', 'images']  # Include user_info

    def get_tag_names(self, obj):
        return [tag.name for tag in obj.tags.all()]  # Return tag names

    def get_upvotes_count(self, obj):
        return obj.ratings.filter(upvote=True).count()  # Count upvotes

    def get_downvotes_count(self, obj):
        return obj.ratings.filter(upvote=False).count()  # Count downvotes
    
    def get_images(self, obj):
        return [image.image.url for image in obj.images.all()]  # Return image URLs



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


# Topic Serializer
class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'created_at', 'user']  # Include fields you want to expose

    def create(self, validated_data):
        return Topic.objects.create(**validated_data)


# Option Serializer
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']  # Include fields you want to expose

    def create(self, validated_data):
        return Option.objects.create(**validated_data)

# Quiz Serializer
class QuizSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)  # Add this line to include options

    class Meta:
        model = Quiz
        fields = ['id', 'topic', 'question', 'correct_answer', 'options', 'explanation']  # Include options in fields

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])  # Extract options from the data
        quiz = Quiz.objects.create(**validated_data)  # Create the quiz instance
        for option_data in options_data:  # Create options
            Option.objects.create(quiz=quiz, **option_data)  # Associate options with the quiz
        return quiz

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)  # Extract options if provided
        instance.topic = validated_data.get('topic', instance.topic)
        instance.question = validated_data.get('question', instance.question)
        instance.correct_answer = validated_data.get('correct_answer', instance.correct_answer)
        instance.save()

        if options_data is not None:
            # Clear existing options and add new ones
            instance.options.all().delete()  # Delete current options
            for option_data in options_data:
                Option.objects.create(quiz=instance, **option_data)  # Create new options
        
        return instance



class QuizSolveSerializer(serializers.ModelSerializer):
    time_interval = serializers.SerializerMethodField()  # Add field for time interval
    num_attempts = serializers.SerializerMethodField()  # Add field for number of attempts
    user_info = UserRegistrationSerializer(source='user', read_only=True)  # Include user information, but make sure it's read-only

    class Meta:
        model = QuizSolve
        fields = ['id','user', 'user_info', 'quiz', 'chosen_option', 'quiz_taking_start', 'quiz_time_end', 'time_interval', 'num_attempts']  # Include new fields

    def get_time_interval(self, obj):
        # Convert both times to timezone-aware if they are not already
        if obj.quiz_taking_start and obj.quiz_time_end:
            quiz_taking_start = timezone.make_aware(obj.quiz_taking_start) if timezone.is_naive(obj.quiz_taking_start) else obj.quiz_taking_start
            quiz_time_end = timezone.make_aware(obj.quiz_time_end) if timezone.is_naive(obj.quiz_time_end) else obj.quiz_time_end

            return timesince(quiz_taking_start, quiz_time_end)  # Return a human-readable time interval
        return None

    def get_num_attempts(self, obj):
        # Count the number of attempts the user made on this quiz
        return QuizSolve.objects.filter(user=obj.user, quiz=obj.quiz).count()

    def create(self, validated_data):
        return QuizSolve.objects.create(**validated_data)


# Blog Serializer
class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = ['id', 'topic', 'title', 'content', 'created_at', 'user']  # Include fields you want to expose

    def create(self, validated_data):
        return Blog.objects.create(**validated_data)


