import requests
import unittest
import os
import base64
from io import BytesIO
from PIL import Image
import json
import time
import random
import string

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://95fb2c41-04b3-4414-bc34-138f31271827.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

def generate_test_image():
    """Generate a simple test image"""
    img = Image.new('RGB', (100, 100), color='red')
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return buffered.getvalue()

class VirtualTryOnAPITest(unittest.TestCase):
    
    def setUp(self):
        """Set up test data"""
        self.test_image = generate_test_image()
        self.test_dress_url = "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        self.tryon_id = None
    
    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n🔍 Testing API health check...")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Virtual Try-On API is running")
        print("✅ API health check passed")
    
    def test_02_create_tryon(self):
        """Test creating a virtual try-on"""
        print("\n🔍 Testing create try-on endpoint...")
        
        # Prepare the form data
        files = {
            'user_image': ('test_image.jpg', self.test_image, 'image/jpeg')
        }
        data = {
            'dress_url': self.test_dress_url
        }
        
        # Make the request
        response = requests.post(f"{API_URL}/tryon", files=files, data=data)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"❌ Create try-on failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            self.fail("Create try-on request failed")
        
        # Parse the response
        try:
            result = response.json()
            self.assertIn("id", result)
            self.assertIn("dress_url", result)
            self.assertIn("original_image_data", result)
            self.assertIn("generated_image_data", result)
            self.assertIn("timestamp", result)
            self.assertIn("status", result)
            
            # Save the try-on ID for later tests
            self.__class__.tryon_id = result["id"]
            print(f"✅ Create try-on passed, got ID: {self.__class__.tryon_id}")
        except json.JSONDecodeError:
            print(f"❌ Failed to parse JSON response: {response.text}")
            self.fail("Invalid JSON response")
    
    def test_03_get_tryon_image(self):
        """Test getting a try-on image"""
        if not hasattr(self.__class__, 'tryon_id'):
            self.skipTest("No try-on ID available from previous test")
        
        print(f"\n🔍 Testing get try-on image endpoint for ID: {self.__class__.tryon_id}...")
        
        # Make the request
        response = requests.get(f"{API_URL}/tryon/{self.__class__.tryon_id}/base64")
        
        # Check if the request was successful
        self.assertEqual(response.status_code, 200)
        
        # Parse the response
        result = response.json()
        self.assertIn("id", result)
        self.assertIn("generated_image_data", result)
        self.assertIn("original_image_data", result)
        
        print("✅ Get try-on image passed")
    
    def test_04_get_all_tryons(self):
        """Test getting all try-ons"""
        print("\n🔍 Testing get all try-ons endpoint...")
        
        # Make the request
        response = requests.get(f"{API_URL}/tryons")
        
        # Check if the request was successful
        self.assertEqual(response.status_code, 200)
        
        # Parse the response
        result = response.json()
        self.assertIsInstance(result, list)
        
        # Check if we have at least one try-on
        if len(result) > 0:
            # Check the structure of the first try-on
            first_tryon = result[0]
            self.assertIn("id", first_tryon)
            self.assertIn("dress_url", first_tryon)
            self.assertIn("original_image_data", first_tryon)
            self.assertIn("generated_image_data", first_tryon)
            self.assertIn("timestamp", first_tryon)
            self.assertIn("status", first_tryon)
        
        print(f"✅ Get all try-ons passed, found {len(result)} try-ons")
    
    def test_05_submit_feedback(self):
        """Test submitting feedback for a try-on"""
        if not hasattr(self.__class__, 'tryon_id'):
            self.skipTest("No try-on ID available from previous test")
        
        print(f"\n🔍 Testing submit feedback endpoint for try-on ID: {self.__class__.tryon_id}...")
        
        # Prepare the feedback data
        feedback_data = {
            "tryon_id": self.__class__.tryon_id,
            "rating": 5,
            "comment": "This is a test feedback comment"
        }
        
        # Make the request
        response = requests.post(
            f"{API_URL}/feedback",
            headers={"Content-Type": "application/json"},
            json=feedback_data
        )
        
        # Check if the request was successful
        self.assertEqual(response.status_code, 200)
        
        # Parse the response
        result = response.json()
        self.assertIn("id", result)
        self.assertEqual(result["tryon_id"], self.__class__.tryon_id)
        self.assertEqual(result["rating"], 5)
        self.assertEqual(result["comment"], "This is a test feedback comment")
        
        # Save the feedback ID
        self.__class__.feedback_id = result["id"]
        print(f"✅ Submit feedback passed, got feedback ID: {self.__class__.feedback_id}")
    
    def test_06_get_feedback(self):
        """Test getting feedback for a try-on"""
        if not hasattr(self.__class__, 'tryon_id'):
            self.skipTest("No try-on ID available from previous test")
        
        print(f"\n🔍 Testing get feedback endpoint for try-on ID: {self.__class__.tryon_id}...")
        
        # Make the request
        response = requests.get(f"{API_URL}/feedback/{self.__class__.tryon_id}")
        
        # Check if the request was successful
        self.assertEqual(response.status_code, 200)
        
        # Parse the response
        result = response.json()
        self.assertIsInstance(result, list)
        
        # Check if we have at least one feedback
        if len(result) > 0:
            # Check the structure of the first feedback
            first_feedback = result[0]
            self.assertIn("id", first_feedback)
            self.assertEqual(first_feedback["tryon_id"], self.__class__.tryon_id)
            self.assertIn("rating", first_feedback)
            self.assertIn("comment", first_feedback)
        
        print(f"✅ Get feedback passed, found {len(result)} feedback entries")
    
    def test_07_error_handling_invalid_tryon_id(self):
        """Test error handling for invalid try-on ID"""
        print("\n🔍 Testing error handling for invalid try-on ID...")
        
        # Generate a random invalid ID
        invalid_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))
        
        # Make the request
        response = requests.get(f"{API_URL}/tryon/{invalid_id}/base64")
        
        # Check if the request returns a 404 error
        self.assertEqual(response.status_code, 404)
        
        print("✅ Error handling for invalid try-on ID passed")
    
    def test_08_error_handling_invalid_dress_url(self):
        """Test error handling for invalid dress URL"""
        print("\n🔍 Testing error handling for invalid dress URL...")
        
        # Prepare the form data with an invalid URL
        files = {
            'user_image': ('test_image.jpg', self.test_image, 'image/jpeg')
        }
        data = {
            'dress_url': "https://invalid-url-that-does-not-exist.com/image.jpg"
        }
        
        # Make the request
        response = requests.post(f"{API_URL}/tryon", files=files, data=data)
        
        # Check if the request returns an error
        self.assertNotEqual(response.status_code, 200)
        
        print(f"✅ Error handling for invalid dress URL passed with status code: {response.status_code}")

if __name__ == "__main__":
    unittest.main(argv=['first-arg-is-ignored'], exit=False)