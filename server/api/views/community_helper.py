

from haversine import haversine, Unit
from api.models import User

def get_users_within_radius(alert_lat, alert_lon, radius_km=50):
    # Get all users
    all_users = User.objects.all()
    
    # List to hold users within the 50KM radius
    users_within_radius = []
    
    # Alert location (latitude, longitude)
    alert_location = (alert_lat, alert_lon)
    
    for user in all_users:
        user_location = (user.location_lat, user.location_lon)  # User's latitude and longitude
        
        # Calculate the distance between the alert and the user
        distance = haversine(alert_location, user_location, unit=Unit.KILOMETERS)
        
        if distance <= radius_km:
            users_within_radius.append(user)  # Add users within the radius
    
    return users_within_radius
