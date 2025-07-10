import requests
import base64
from io import BytesIO
from PIL import Image

# Create a simple test image
img = Image.new('RGB', (300, 400), color='red')
img_bytes = BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)

# Test the API
url = "https://95fb2c41-04b3-4414-bc34-138f31271827.preview.emergentagent.com/api/tryon"
dress_url = "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

files = {
    'user_image': ('test.jpg', img_bytes.getvalue(), 'image/jpeg')
}
data = {
    'dress_url': dress_url
}

print("Testing virtual try-on API...")
response = requests.post(url, files=files, data=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}...")

if response.status_code == 200:
    result = response.json()
    print(f"Success! Try-on ID: {result.get('id')}")
    print("The virtual try-on functionality is working!")
else:
    print("Error occurred during try-on generation")
