# Generated by Django 5.0.1 on 2024-10-02 10:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_alter_quizsolve_chosen_option_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='PostImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='post_images/')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='api.post')),
            ],
        ),
    ]
