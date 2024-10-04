from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import datetime
from django.http import JsonResponse
import requests
from datetime import datetime
from rest_framework import status
from django.http import JsonResponse

from google.oauth2 import service_account
import ee
import geemap.core as geemap

import os
from dotenv import load_dotenv


load_dotenv()
PROJECT = os.getenv("PROJECT")


# Authenticate to the Earth Engine servers
try:
    ee.Initialize(project=PROJECT)
except Exception as e:
    ee.Authenticate()
    ee.Initialize(project=PROJECT)

def get_evapotranspiration_series(lat, lon, start, end):
    # Load the MODIS evapotranspiration dataset
    collection = ee.ImageCollection('MODIS/061/MOD16A2').select('ET').filterDate(start, end)
    point = ee.Geometry.Point(float(lon), float(lat))

    # Map over the collection and get the ET value at each time step
    et_values = collection.map(lambda image: 
        ee.Feature(None, {
            'date': image.date().format('YYYY-MM-dd'),  # Get the date of the image
            'ET': image.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=500,  # Approximate scale of the MODIS data in meters
                maxPixels=1e9
            ).get('ET')  # Get the ET value at the given point
        })
    )

    # Convert to a FeatureCollection and get the features
    et_feature_collection = ee.FeatureCollection(et_values)
    print(et_feature_collection)
    features_list = et_feature_collection.getInfo()['features'] # Get the features list
    
    property_list = [] 
    for feature in features_list:
        properties = feature['properties']
        property_list.append(properties)
    
    # make the field names more user-friendly i will send  date and data
    for item in property_list:
        item['date'] = item.pop('date')
        item['value'] = item.pop('ET')
    

    # Return the features list as a JSON response
    return Response(property_list, status=status.HTTP_200_OK)

def get_soil_moisture_series(lat, lon, start, end):
    # Load the SMAP soil moisture dataset
    collection = ee.ImageCollection('NASA_USDA/HSL/SMAP10KM_soil_moisture').select('ssm').filterDate(start, end)
    point = ee.Geometry.Point(float(lon), float(lat))

    # Map over the collection and get the soil moisture value at each time step
    sm_values = collection.map(lambda image: 
        ee.Feature(None, {
            'date': image.date().format('YYYY-MM-dd'),  # Get the date of the image
            'SM': image.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=500,  # Approximate scale of the SMAP data in meters
                maxPixels=1e9
            ).get('ssm')  # Get the soil moisture value at the given point
        })
    )

    # Convert to a FeatureCollection and get the features
    sm_feature_collection = ee.FeatureCollection(sm_values)
    features_list = sm_feature_collection.getInfo()['features']  # Get the features list

    property_list = [] 
    for feature in features_list:
        properties = feature['properties']
        property_list.append(properties)
    
    # make the field names more user-friendly i will send  date and data
    for item in property_list:
        item['date'] = item.pop('date')
        item['value'] = item.pop('SM')
    
    # Return the features list as a JSON response
    return Response(property_list, status=status.HTTP_200_OK)

def get_vegetation_indices_series(lat, lon, start, end):
    # Load the MODIS NDVI dataset
    collection = ee.ImageCollection('MODIS/061/MOD13A1').select('NDVI').filterDate(start, end)
    point = ee.Geometry.Point(float(lon), float(lat))

    # Map over the collection and get the NDVI value at each time step
    ndvi_values = collection.map(lambda image: 
        ee.Feature(None, {
            'date': image.date().format('YYYY-MM-dd'),  # Get the date of the image
            'NDVI': image.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=500,  # Approximate scale of the MODIS data in meters
                maxPixels=1e9
            ).get('NDVI')  # Get the NDVI value at the given point
        })
    )

    # Convert to a FeatureCollection and get the features
    ndvi_feature_collection = ee.FeatureCollection(ndvi_values)
    features_list = ndvi_feature_collection.getInfo()['features']  # Get the features list

    property_list = [] 
    for feature in features_list:
        properties = feature['properties']
        property_list.append(properties)
    
    # make the field names more user-friendly i will send  date and data
    for item in property_list:
        item['date'] = item.pop('date')
        item['value'] = item.pop('NDVI')
    
    # Return the features list as a JSON response
    return Response(property_list, status=status.HTTP_200_OK)



@api_view(['GET'])
def getGEEData(request):
    try:
        parametar = request.query_params.get('parameter')
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        long = float(request.query_params.get('long', 0))  # Default to 0 if not provided
        lat = float(request.query_params.get('lat', 0))    # Default to 0 if not provided

        if not parametar or not start or not end or long == 0 or lat == 0:
            return JsonResponse({"error": "Missing required parameters."}, status=status.HTTP_400_BAD_REQUEST)

        if parametar == "ET":
            return get_evapotranspiration_series(lat, long, start, end)
        elif parametar == "SM":
            return get_soil_moisture_series(lat, long, start, end)
        elif parametar == "NDVI":
            return get_vegetation_indices_series(lat, long, start, end)

        return JsonResponse({"message": "No valid parameter specified."}, status=status.HTTP_400_BAD_REQUEST)

    except ValueError as ve:
        return JsonResponse({"error": "Invalid parameter values."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)





def get_surface_temperature_heatmap(start, end):
    try:
        # Convert start and end to ee.Date
        start_date = ee.Date(start)
        end_date = ee.Date(end)
        
        # Get the image collection for the specified date range
        dataset = ee.ImageCollection('MODIS/061/MOD11A1') \
                    .filterDate(start_date, end_date)
        
        # Select the 'LST_Day_1km' band for land surface temperature
        land_surface_temperature = dataset.select('LST_Day_1km')
        
        # Define visualization parameters
        land_surface_temperature_vis = {
            'min': 13000.0,
            'max': 16500.0,
            'palette': [
                '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
                '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
                '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
                'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
                'ff0000', 'de0101', 'c21301', 'a71001', '911003'
            ]
        }
        
        # Extract data to a format that can be returned as JSON
        
        
        # Prepare the response data
        data = {
            "temperature_data": land_surface_temperature,
            "visualization_params": land_surface_temperature_vis
        }

        return data

    except Exception as e:
        print(e)



# API View to handle the heatmap request
@api_view(['GET'])
def get_heatmap(request):
    
    start = request.query_params.get('start')
    end = request.query_params.get('end')
    parameter = request.query_params.get('parameter')


    
    # Check if the required parameters are provided
    if not start or not end or not parameter:
        return Response({"error": "Missing required parameters."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get the data from the GEE API
    if parameter == "TS":
        data = get_surface_temperature_heatmap(start, end)
        return Response(data, status=status.HTTP_200_OK)
    
    return Response({"message": "This is a test response from the backend."}, status=status.HTTP_200_OK)
