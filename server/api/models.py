from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager

# Create your models here.



### Community features ###
# Base User Model
class User(AbstractUser):
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()
    password = models.CharField(max_length=255)
    location_lat = models.FloatField(default=0.00)  # Latitude of the user's location
    location_lon = models.FloatField(default=0.00)  # Longitude of the user's location
    region = models.CharField(max_length=255, default="Dhaka")  # Region where the user is located
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    is_expert = models.BooleanField(default=False)  # Expert or Regular User

    def __str__(self):
        return self.username

# Regular User Model
class RegularUser(User):
    def __str__(self):
        return f'RegularUser: {self.username}'

# Tag Model - For different categories/tags associated with posts and expertise
class Tag(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# Expert User Model
class ExpertUser(User):
    expertise_tags = models.ManyToManyField(Tag, related_name='expertise_tags')  # Tags representing areas of expertise
    expertise_description = models.TextField()  # Description of the expertise in detail

    def __str__(self):
        return f'ExpertUser: {self.username}, Expertise: {self.get_expertise_tags()}'

    def get_expertise_tags(self):
        return ", ".join([tag.name for tag in self.expertise_tags.all()])

# Post Model - Represents a farmer's post/question
class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User (either RegularUser or ExpertUser)
    title = models.CharField(max_length=255)  # Post title
    content = models.TextField()  # Post content
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.ManyToManyField(Tag, blank=True)  # Tags associated with the post

    def __str__(self):
        return self.title

# Comment Model - Represents comments or replies on a post. Recursive relationship for replies.
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')  # Link to Post
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User
    content = models.TextField()  # Comment content
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')  # Recursive reply
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.content[:50]  # Display a snippet of the comment

# Rating Model - Represents ratings given to a post
class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='ratings')  # Link to Post
    upvote = models.BooleanField(default=False)  # Upvote or Downvote
    rated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.rating}'

# Alert Model - For alert posts that need special attention
class Alert(models.Model):
    post = models.OneToOneField(Post, on_delete=models.CASCADE)  # Link to Post
    alert_type = models.CharField(max_length=100)  # Type of alert (can be various alert types)
    alert_location_lat = models.FloatField()  # Latitude of the alert's location
    alert_location_lon = models.FloatField()  # Longitude of the alert's location
    alert_region = models.CharField(max_length=255)  # Region for the alert

    def __str__(self):
        return f'Alert: {self.post.title}'
    


# Default symptoms. These should have a many to mane relation with diseases


class Symptom(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name



class DiseaseStatistics(models.Model):
    disease = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    reported_at = models.DateTimeField(auto_now_add=True)
    symptoms = models.ManyToManyField(Symptom)


    def __str__(self):
        return f'{self.disease} - {self.region}'
    
class CommentRating(models.Model):
    UPVOTE = 1
    DOWNVOTE = -1
    RATING_CHOICES = [(UPVOTE, 'Upvote'), (DOWNVOTE, 'Downvote')]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='ratings')
    value = models.SmallIntegerField(choices=RATING_CHOICES)  # 1 for upvote, -1 for downvote

    class Meta:
        unique_together = ('user', 'comment')  # Ensure unique rating per user per comment

    def __str__(self):
        return f'{self.user.username} rated {self.comment.id} with {self.value}'



### Community features ###
