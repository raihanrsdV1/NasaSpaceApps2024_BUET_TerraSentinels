# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from django.db.models.functions import TruncMonth
import datetime
import random
from ..models import PestStatistics, Pest
from ..serializers import PestStatisticsSerializer

@api_view(['GET'])
def generate_pest_statistics(request, n=1000):
    # Generating statistics for the past year
    base_date = datetime.datetime.now()
    pest_statistics = []

    for _ in range(n):
        # Random date within the past year
        random_days = random.randint(0, 365)
        reported_at = base_date - datetime.timedelta(days=random_days)

        # Randomly select a pest
        pest = random.choice(Pest.objects.all())

        # Create a PestStatistic object
        pest_statistic = PestStatistics(
            pest=pest,
            region=f"Region {random.randint(1, 10)}",
            latitude=random.uniform(-90, 90),
            longitude=random.uniform(-180, 180),
            reported_at=reported_at  # Assigning the random date
        )
        pest_statistic.save()
        pest_statistics.append(pest_statistic)

    return Response({'message': f'{n} pest statistics generated'})


@api_view(['GET'])
def get_unique_pests(request):
    unique_pests = PestStatistics.objects.values_list('pest__name', flat=True).distinct()
    return Response({"unique_pests": list(unique_pests)})


@api_view(['GET'])
def pest_occurrence(request):
    # Count occurrences of each pest
    pest_counts = PestStatistics.objects.values('pest__name').annotate(count=Count('pest')).order_by('pest__name')

    # Prepare the response data
    data = {
        'pests': [item['pest__name'] for item in pest_counts],
        'counts': [item['count'] for item in pest_counts]
    }

    return Response(data)

@api_view(['GET'])
def pest_time_series(request):
    # Filter data for each pest and group by month
    pest_data = (
        PestStatistics.objects
        .annotate(month=TruncMonth('reported_at'))  # Group by month
        .values('month', 'pest__name')  # Extract month and pest name
        .annotate(count=Count('id'))  # Count occurrences in each month
        .order_by('month', 'pest__name')  # Order by month and pest name
    )

    # Prepare the response data
    pest_counts = {}
    for item in pest_data:
        pest_name = item['pest__name']
        month = item['month'].strftime('%Y-%m')
        count = item['count']

        if pest_name not in pest_counts:
            pest_counts[pest_name] = {
                'months': [],
                'counts': []
            }
        
        pest_counts[pest_name]['months'].append(month)
        pest_counts[pest_name]['counts'].append(count)

    # Convert to a list for response
    data = {
        'pests': list(pest_counts.keys()),  # Unique pests
        'data': pest_counts  # Pest specific data
    }

    return Response(data)