from datetime import datetime
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

NASA_POWER_API_URL = "https://power.larc.nasa.gov/api/temporal/daily/point?"

def build_request(start, end, long, lat, parameter=None):
    """
    Build the NASA Power API request URL.
    """
    if parameter is None:
        parameter = ['T2M_RANGE', 'TS', 'T2MDEW', 'T2MWET', 'T2M_MAX', 'T2M_MIN', 'T2M', 'QV2M', 'RH2M',
                     'PRECTOTCORR', 'PS', 'WS10M', 'WS10M_MAX', 'WS10M_MIN', 'WS10M_RANGE', 'WS50M', 'WS50M_MAX',
                     'WS50M_MIN', 'WS50M_RANGE']
    
    request = NASA_POWER_API_URL
    request += f"parameters={','.join(parameter)}"
    request += '&community=RE'
    request += f"&longitude={long}"
    request += f"&latitude={lat}"
    request += f"&start={start.strftime('%Y%m%d')}"
    request += f"&end={end.strftime('%Y%m%d')}"
    request += '&format=JSON'
    
    return request

@api_view(['GET'])
def get_weather_data(request, parameter, start, end, long, lat):    
    start = datetime.strptime(start, '%Y%m%d')
    end = datetime.strptime(end, '%Y%m%d')
    
    # to show the graph in a nice way, we can't have too many data points - so max - 6 months.
    if (end - start).days > 180:
        return Response("Please select a date range of 6 months or less", status=status.HTTP_400_BAD_REQUEST)
    
    request_url = build_request(start, end, long, lat, parameter=[parameter])
    response = requests.get(request_url)

    if response.status_code == 200:
        data_json = response.json()
        records = data_json['properties']['parameter']
        return Response(records, status=status.HTTP_200_OK)
    else:
        return Response("Error fetching data from NASA", status=status.HTTP_400_BAD_REQUEST)