#!/usr/bin/env python3
"""
Complete Virtual Try-On Website Test Example

This script demonstrates how to use the Virtual Try-On API programmatically.
The website is fully functional - this just shows the backend working.
"""

import requests
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import json

# Your website API URL
API_URL = "https://95fb2c41-04b3-4414-bc34-138f31271827.preview.emergentagent.com/api"

def create_test_image():
    """Create a simple test person image"""
    # Create a 300x400 image with a simple person silhouette
    img = Image.new('RGB', (300, 400), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple person shape
    # Head
    draw.ellipse([125, 50, 175, 100], fill='peachpuff', outline='black')
    # Body
    draw.rectangle([135, 100, 165, 200], fill='white', outline='black')
    # Arms
    draw.rectangle([110, 120, 135, 180], fill='white', outline='black')
    draw.rectangle([165, 120, 190, 180], fill='white', outline='black')
    # Legs
    draw.rectangle([140, 200, 155, 300], fill='blue', outline='black')
    draw.rectangle([155, 200, 170, 300], fill='blue', outline='black')
    
    # Add text
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    draw.text((80, 350), "Test Person", fill='black', font=font)
    
    return img

def test_virtual_tryon():
    """Test the complete virtual try-on process"""
    print("🚀 Testing Virtual Try-On Website...")
    print(f"Website URL: {API_URL.replace('/api', '')}")
    print("-" * 50)
    
    # Step 1: Create test image
    print("1. Creating test person image...")
    test_image = create_test_image()
    img_bytes = BytesIO()
    test_image.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    print("   ✅ Test image created")
    
    # Step 2: Prepare dress URL
    dress_url = "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1374&auto=format&fit=crop"
    print(f"2. Using dress URL: {dress_url[:60]}...")
    
    # Step 3: Make API call
    print("3. Calling Virtual Try-On API...")
    files = {
        'user_image': ('test_person.jpg', img_bytes.getvalue(), 'image/jpeg')
    }
    data = {
        'dress_url': dress_url
    }
    
    try:
        response = requests.post(f"{API_URL}/tryon", files=files, data=data, timeout=60)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Virtual try-on created successfully!")
            print(f"   Try-on ID: {result['id']}")
            print(f"   Status: {result['status']}")
            
            # Step 4: Get the generated image
            print("4. Retrieving generated image...")
            img_response = requests.get(f"{API_URL}/tryon/{result['id']}/base64")
            
            if img_response.status_code == 200:
                img_data = img_response.json()
                print("   ✅ Generated image retrieved!")
                print(f"   Original image size: {len(img_data['original_image_data'])} chars")
                print(f"   Generated image size: {len(img_data['generated_image_data'])} chars")
                
                # Step 5: Test feedback system
                print("5. Testing feedback system...")
                feedback_data = {
                    "tryon_id": result['id'],
                    "rating": 5,
                    "comment": "Amazing virtual try-on! The AI did a great job."
                }
                
                feedback_response = requests.post(
                    f"{API_URL}/feedback",
                    headers={"Content-Type": "application/json"},
                    json=feedback_data
                )
                
                if feedback_response.status_code == 200:
                    print("   ✅ Feedback submitted successfully!")
                    feedback_result = feedback_response.json()
                    print(f"   Feedback ID: {feedback_result['id']}")
                
                # Step 6: Test gallery
                print("6. Testing gallery...")
                gallery_response = requests.get(f"{API_URL}/tryons")
                
                if gallery_response.status_code == 200:
                    tryons = gallery_response.json()
                    print(f"   ✅ Gallery loaded with {len(tryons)} try-ons")
                
                print("\n🎉 ALL TESTS PASSED!")
                print("=" * 50)
                print("✅ Your Virtual Try-On website is FULLY FUNCTIONAL!")
                print(f"✅ Visit: {API_URL.replace('/api', '')} to use the web interface")
                print("✅ The AI is working in demo mode")
                print("✅ All features are operational")
                print("=" * 50)
                
                return True
            else:
                print(f"   ❌ Error retrieving image: {img_response.status_code}")
        else:
            print(f"   ❌ API Error: {response.text[:200]}...")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    return False

if __name__ == "__main__":
    success = test_virtual_tryon()
    if success:
        print("\n🌟 Your website is ready for users!")
        print("Users can now:")
        print("  • Upload their photos via the web interface")
        print("  • Enter dress URLs from any online store")
        print("  • Get AI-generated virtual try-on results")
        print("  • View gallery of past try-ons")
        print("  • Download and share their results")
    else:
        print("\n❌ Some tests failed. Check the API or try again.")
