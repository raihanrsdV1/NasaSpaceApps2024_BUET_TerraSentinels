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
    phone_no = models.CharField(max_length=15, blank=True)
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
    is_question = models.BooleanField(default=False)  # Question or general post
    is_answered = models.BooleanField(default=False)  # Answered or not

    def __str__(self):
        return self.title
    


class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')  # Link to Post
    image = models.ImageField(upload_to='post_images/')  # Field to store the image file

    def __str__(self):
        return f"Image for post: {self.post.title}"

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


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    is_seen = models.BooleanField(default=False)
    is_alert = models.BooleanField(default=False)

    def __str__(self):
        return self.content[:50]  # Display a snippet of the notification


### Community features ###



### quizzing features ###
 # Assuming you want to link to the User model for authors

# Topic Model - Represents a topic that may contain multiple quizzes and blogs
class Topic(models.Model):
    name = models.CharField(max_length=255, unique=True)  # Unique topic name
    description = models.TextField(blank=True)  # Optional description for the topic
    created_at = models.DateTimeField(auto_now_add=True)  # Creation date
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Author of the topic

    def __str__(self):
        return self.name


# Quiz Model - Represents a quiz associated with a specific topic
class Quiz(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='quizzes')  # Topic the quiz belongs to
    question = models.TextField()  # Quiz question
    correct_answer = models.ForeignKey('Option', on_delete=models.PROTECT, related_name='correct_for_quiz', blank=True, null=True)  # Correct answer option
    explanation = models.TextField(blank=True)  # Explanation for the answer

    def __str__(self):
        return self.question


# Option Model - Represents options for a quiz question
class Option(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='options')  # Quiz this option belongs to
    text = models.CharField(max_length=255)  # Text for the option

    def __str__(self):
        return self.text


# QuizSolve Model - Represents a user's attempt to solve a quiz
class QuizSolve(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who took the quiz
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)  # Quiz that was taken
    chosen_option = models.ForeignKey(Option, on_delete=models.CASCADE, blank=True, null=True)  # Option chosen by the user
    quiz_taking_start = models.DateTimeField(auto_now_add=True)  # When the quiz was started
    quiz_time_end = models.DateTimeField(blank=True, null=True)  # When the quiz was submitted

    def __str__(self):
        return f"{self.user.username} - {self.quiz.question}"


# Blog Model - Represents a blog related to a specific topic
class Blog(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='blogs')  # Topic the blog belongs to
    title = models.CharField(max_length=255)  # Blog title
    content = models.TextField()  # Blog content
    created_at = models.DateTimeField(auto_now_add=True)  # Creation date
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Author of the blog

    def __str__(self):
        return self.title



