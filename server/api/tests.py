from django.test import TestCase
from .models import *
from .views.community_helper import get_users_within_radius
from faker import Faker

class AlertNotificationTestCase(TestCase):
    
    def setUp(self):
        # Initialize Faker for generating random data
        self.fake = Faker()
        
        # Create users at different locations with unique emails and valid location fields
        self.user1 = User.objects.create(
            username="user1", 
            email=self.fake.unique.email(), 
            location_lat=23.8103, 
            location_lon=90.4125  # Dhaka
        )
        self.user2 = User.objects.create(
            username="user2", 
            email=self.fake.unique.email(), 
            location_lat=40.7128, 
            location_lon=-74.0060  # New York
        )
        self.user3 = User.objects.create(
            username="user3", 
            email=self.fake.unique.email(), 
            location_lat=23.7465, 
            location_lon=90.3965  # Inside 50KM
        )
        self.user4 = User.objects.create(
            username="user4", 
            email=self.fake.unique.email(), 
            location_lat=23.9354, 
            location_lon=90.4254  # Exactly 50KM
        )
        self.user5 = User.objects.create(
            username="user5", 
            email=self.fake.unique.email(), 
            location_lat=23.7565, 
            location_lon=90.4000  # 10KM away
        )

        # Create a post for each user
        self.post1 = Post.objects.create(user=self.user1, title="User 1 Post", content="Content for user 1.")
        self.post2 = Post.objects.create(user=self.user2, title="User 2 Post", content="Content for user 2.")
        self.post3 = Post.objects.create(user=self.user3, title="User 3 Post", content="Content for user 3.")
        self.post4 = Post.objects.create(user=self.user4, title="User 4 Post", content="Content for user 4.")
        self.post5 = Post.objects.create(user=self.user5, title="User 5 Post", content="Content for user 5.")

    # Test Case 1: Alert with No Nearby Users
    def test_alert_with_no_nearby_users(self):
        alert = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertNotIn(self.user2, nearby_users)  # User2 (New York) should not be in the radius

    # Test Case 2: Alert with Users Exactly on the 50KM Boundary
    def test_alert_with_users_on_50km_boundary(self):
        alert = Alert.objects.create(
            post=self.post4,  # Associate the alert with user4's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertIn(self.user4, nearby_users)  # User4 is exactly 50KM away and should be notified

    # Test Case 3: Alert with Users Inside the 50KM Radius
    def test_alert_with_users_within_radius(self):
        alert = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertIn(self.user3, nearby_users)  # User3 is within the radius
        self.assertIn(self.user5, nearby_users)  # User5 is also within the radius

    # Test Case 4: Alert with Users Outside the 50KM Radius
    def test_alert_with_users_outside_radius(self):
        alert = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertNotIn(self.user2, nearby_users)  # User2 (New York) is outside the radius
        self.assertIn(self.user1, nearby_users)  # User1 should still be included
    
    # Test Case 5: Users at the Same Location as the Alert
    def test_users_at_same_location(self):
        alert = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertIn(self.user1, nearby_users)  # User1 is exactly at the same location

    # Test Case 6: Users Near the Boundary of 50KM Radius
    def test_users_near_boundary(self):
        alert = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertIn(self.user4, nearby_users)  # User4 is exactly on the boundary
        self.assertNotIn(self.user2, nearby_users)  # New York is way out of range

    # Test Case 7: Multiple Alerts with Overlapping Radius
    def test_multiple_alerts_overlapping_radius(self):
        alert1 = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        alert2 = Alert.objects.create(
            post=self.post3,  # Associate the alert with user3's post
            alert_location_lat=23.7465, 
            alert_location_lon=90.3965  # Close location
        )
        nearby_users_alert1 = get_users_within_radius(alert1.alert_location_lat, alert1.alert_location_lon, radius_km=50)
        nearby_users_alert2 = get_users_within_radius(alert2.alert_location_lat, alert2.alert_location_lon, radius_km=50)
        self.assertIn(self.user3, nearby_users_alert1)  # User3 should be within alert1's radius
        self.assertIn(self.user3, nearby_users_alert2)  # User3 should also be within alert2's radius

    # Test Case 8: Large Number of Users (Stress Test)
    def test_large_number_of_users(self):
    # Create an alert
        alert = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )

    # Simulate 1000 users randomly placed
        for i in range(1000):
            User.objects.create(
                username=self.fake.unique.user_name(),  # Use Faker to ensure uniqueness
                email=self.fake.unique.email(), 
                location_lat=23.8 + (i * 0.0001), 
                location_lon=90.41 + (i * 0.0001)
            )
        
    # Call the radius function
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertTrue(len(nearby_users) > 0)  # Ensure users are found


    # Test Case 9: Invalid Latitude and Longitude in Alert
    def test_invalid_latitude_longitude(self):
        with self.assertRaises(ValueError):  # Assume validation fails on invalid coordinates
            Alert.objects.create(alert_location_lat=200.0000, alert_location_lon=90.4125)

    # Test Case 10: Users with No Latitude/Longitude Set
    def test_users_with_no_latitude_longitude(self):
        User.objects.create(username="user6", email=self.fake.unique.email(), location_lat=None, location_lon=None)
        alert = Alert.objects.create(
            post=self.post1,  # Associate the alert with user1's post
            alert_location_lat=23.8103, 
            alert_location_lon=90.4125
        )
        nearby_users = get_users_within_radius(alert.alert_location_lat, alert.alert_location_lon, radius_km=50)
        self.assertNotIn(User.objects.get(username="user6"), nearby_users)  # User with no location should not be included
