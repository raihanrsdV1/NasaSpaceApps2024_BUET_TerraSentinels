from django.contrib import admin
from .models import User, Post, Comment, Tag, CommentRating, Alert, DiseaseStatistics, Symptom

# Register your models here.

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Tag)
admin.site.register(CommentRating)
admin.site.register(Alert)
admin.site.register(DiseaseStatistics)
admin.site.register(Symptom)
