from datetime import datetime
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

import requests
import folium
import math
from geopy.distance import geodesic 
import numpy as np

OSM_API_URL = "http://overpass-api.de/api/interprete"


def get_specific_water_sources2(lat, lon, radius=1000):
    
    overpass_query = f"""
    [out:json];
    (
      node["waterway"="river"](around:{radius},{lat},{lon});
      node["waterway"="canal"](around:{radius},{lat},{lon});
      node["waterway"="stream"](around:{radius},{lat},{lon});
      node["waterway"="waterfall"](around:{radius},{lat},{lon});
      node["man_made"="water_well"](around:{radius},{lat},{lon});
      node["man_made"="dam"](around:{radius},{lat},{lon});
      node["man_made"="aqueduct"](around:{radius},{lat},{lon});
      node["natural"="water"]["water"="pond"](around:{radius},{lat},{lon});
      node["natural"="water"]["water"="lake"](around:{radius},{lat},{lon});
      node["natural"="water"]["water"="reservoir"](around:{radius},{lat},{lon});
      node["natural"="spring"](around:{radius},{lat},{lon});
      node["natural"="bay"](around:{radius},{lat},{lon});
      node["natural"="glacier"](around:{radius},{lat},{lon});
      node["harbour"="yes"](around:{radius},{lat},{lon});
      node["amenity"="fountain"](around:{radius},{lat},{lon});
      way["waterway"="river"](around:{radius},{lat},{lon});
      way["waterway"="canal"](around:{radius},{lat},{lon});
      way["waterway"="stream"](around:{radius},{lat},{lon});
      way["waterway"="waterfall"](around:{radius},{lat},{lon});
      way["man_made"="dam"](around:{radius},{lat},{lon});
      way["man_made"="aqueduct"](around:{radius},{lat},{lon});
      way["natural"="water"]["water"="pond"](around:{radius},{lat},{lon});
      way["natural"="water"]["water"="lake"](around:{radius},{lat},{lon});
      way["natural"="water"]["water"="reservoir"](around:{radius},{lat},{lon});
      way["natural"="spring"](around:{radius},{lat},{lon});
      way["natural"="bay"](around:{radius},{lat},{lon});
      way["natural"="glacier"](around:{radius},{lat},{lon});
      way["harbour"="yes"](around:{radius},{lat},{lon});
      way["amenity"="fountain"](around:{radius},{lat},{lon});
      relation["waterway"="river"](around:{radius},{lat},{lon});
      relation["waterway"="canal"](around:{radius},{lat},{lon});
      relation["waterway"="stream"](around:{radius},{lat},{lon});
      relation["waterway"="waterfall"](around:{radius},{lat},{lon});
      relation["man_made"="dam"](around:{radius},{lat},{lon});
      relation["man_made"="aqueduct"](around:{radius},{lat},{lon});
      relation["natural"="water"]["water"="pond"](around:{radius},{lat},{lon});
      relation["natural"="water"]["water"="lake"](around:{radius},{lat},{lon});
      relation["natural"="water"]["water"="reservoir"](around:{radius},{lat},{lon});
      relation["natural"="spring"](around:{radius},{lat},{lon});
      relation["natural"="bay"](around:{radius},{lat},{lon});
      relation["natural"="glacier"](around:{radius},{lat},{lon});
      relation["harbour"="yes"](around:{radius},{lat},{lon});
      relation["amenity"="fountain"](around:{radius},{lat},{lon});
    );
    out body;
    >;
    out skel qt;
    """


    
    response = requests.post(OSM_API_URL, data={'data': overpass_query})
    
    data = response.json()
    
    water_sources = []
    for element in data['elements']:
        if 'lat' in element and 'lon' in element:
            water_sources.append((element['lat'], element['lon']))
    
    return water_sources

def get_specific_water_sources1(lat, lon, radius=1000):
    OSM_API_URL = "http://overpass-api.de/api/interpreter"
    
    overpass_query = f"""
    [out:json];
    (
      node["natural"="water"](around:{radius},{lat},{lon});
      way["natural"="water"](around:{radius},{lat},{lon});
      relation["natural"="water"](around:{radius},{lat},{lon});
    );
    out body;
    >;
    out skel qt;
    """

    
    response = requests.post(OSM_API_URL, data={'data': overpass_query})
    
    data = response.json()
    
    water_sources = []
    for element in data['elements']:
        if 'lat' in element and 'lon' in element:
            water_sources.append((element['lat'], element['lon']))
    
    return water_sources

def plot_water_sources(lat, lon, water_sources):
    water_map = folium.Map(location=[lat, lon], zoom_start=13)
    
    folium.Marker([lat, lon], tooltip="Your Location", icon=folium.Icon(color="blue")).add_to(water_map)
    
    for water_lat, water_lon in water_sources:
        folium.Marker([water_lat, water_lon], tooltip="Water Source", icon=folium.Icon(color="green")).add_to(water_map)
    
    water_map.save("water_sources_map3.html")
    print("Map saved as 'water_sources_map3.html'.")

def haversine(lat1, lon1, lat2, lon2):
    R = 6371 

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

def filter_nearby_points(lat, lon, combined_water_sources, max_distance=1):
    filtered_sources = []
    for point_lat, point_lon in combined_water_sources:
        distance = haversine(lat, lon, point_lat, point_lon)
        if distance <= max_distance:
            filtered_sources.append((point_lat, point_lon))
    return filtered_sources


def cluster_and_reduce_points(water_sources, threshold_distance=0.1):
    clustered_sources = []
    used_points = set()

    for idx, source in enumerate(water_sources):
        if idx in used_points:
            continue
        cluster = [source]
        used_points.add(idx)

        for other_idx, other_source in enumerate(water_sources):
            if other_idx in used_points:
                continue

            distance = geodesic(source, other_source).kilometers

            if distance <= threshold_distance:
                cluster.append(other_source)
                used_points.add(other_idx)

        cluster_lat = [p[0] for p in cluster]
        cluster_lon = [p[1] for p in cluster]
        centroid = (np.mean(cluster_lat), np.mean(cluster_lon))

        clustered_sources.append(centroid)

    return clustered_sources

def get_water_resource_data(long, lat, max_distance=1):  #max_distance in kilometers
    water_sources1 = get_specific_water_sources1(lat, long, max_distance*1000)
    water_sources2 = get_specific_water_sources2(lat, long, max_distance*1000)
    combined_water_sources = set(water_sources1 + water_sources2)
    nearby_water_sources = filter_nearby_points(lat, long, combined_water_sources, max_distance)
    reduced_water_sources = cluster_and_reduce_points(nearby_water_sources, threshold_distance=0.1)
    #print(len(nearby_water_sources))
    #print(len(reduced_water_sources))
    
    if reduced_water_sources:
        print("Nearby Water Sources (rivers, canals, wells, ponds, reservoirs):")
        #for idx, (lat, lon) in enumerate(nearby_water_sources):
            #print(f"{idx+1}. Latitude: {lat}, Longitude: {lon}")
        plot_water_sources(lat, long, reduced_water_sources)
    else:
        print("No specific water sources found nearby.")

