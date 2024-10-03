from datetime import datetime
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse

OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather?"

def build_request(lat, lon):
    """
    Build the OpenWeather API request URL.
    """
    request = OPENWEATHER_API_URL
    request += f"lat={lat}"
    request += f"&lon={lon}"
    request += "&appid=8ee410c9563ec6135fcdc84b16dcd79f"    ############### API KEY ###############
    
    return request


@api_view(['GET'])
def get_weather_summary(request, lat, lon):
    request_url = build_request(lat, lon)
    response = requests.get(request_url)
    print("here")
    if response.status_code == 200:
        data_json = response.json()
        temperature = data_json['main']['temp'] - 273.15
        feels_like = data_json['main']['feels_like'] - 273.15
        temp_max= data_json['main']['temp_max'] - 273.15
        temp_min= data_json['main']['temp_min'] - 273.15

        refined_data = {
            "temperature": round(temperature, 2),
            "feels_like": round(feels_like, 2),
            "temp_max": round(temp_max, 2),
            "temp_min": round(temp_min, 2),
            "humidity": data_json['main']['humidity'],
            "wind_speed": data_json['wind']['speed'],
            "pressure": data_json['main']['pressure'],
            "remark": "" + data_json['weather'][0]['description'].title()
      
        }
        print(refined_data)

        return JsonResponse(refined_data)
    else:
        return Response("Error fetching data from OpenWeather", status=status.HTTP_400_BAD_REQUEST)