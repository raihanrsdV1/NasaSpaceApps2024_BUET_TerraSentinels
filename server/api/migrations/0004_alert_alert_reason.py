# Generated by Django 5.0.1 on 2024-10-05 11:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_pest'),
    ]

    operations = [
        migrations.AddField(
            model_name='alert',
            name='alert_reason',
            field=models.TextField(default='None'),
        ),
    ]