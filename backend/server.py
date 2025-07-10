from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import base64
import io
from PIL import Image
from openai import OpenAI
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenAI client
openai_client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class TryOnRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dress_url: str
    user_image_data: str  # base64 encoded image
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "processing"

class TryOnResponse(BaseModel):
    id: str
    dress_url: str
    original_image_data: str
    generated_image_data: str
    timestamp: datetime
    status: str

class FeedbackRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tryon_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FeedbackResponse(BaseModel):
    id: str
    tryon_id: str
    rating: int
    comment: Optional[str]
    timestamp: datetime

# Utility Functions
async def download_image_as_base64(url: str) -> str:
    """Download image from URL and convert to base64"""
    try:
        import requests
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return base64.b64encode(response.content).decode('utf-8')
    except Exception as e:
        logger.error(f"Error downloading image from {url}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")

def base64_to_image(base64_str: str) -> Image.Image:
    """Convert base64 string to PIL Image"""
    try:
        image_data = base64.b64decode(base64_str.split(',')[-1])  # Remove data URL prefix if present
        return Image.open(io.BytesIO(image_data))
    except Exception as e:
        logger.error(f"Error converting base64 to image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    try:
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error converting image to base64: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

async def generate_tryon_image(user_image: Image.Image, dress_image: Image.Image) -> str:
    """Generate try-on image using OpenAI API"""
    try:
        # Convert images to bytes for OpenAI API
        user_img_bytes = io.BytesIO()
        user_image.save(user_img_bytes, format='PNG')
        user_img_bytes.seek(0)
        
        dress_img_bytes = io.BytesIO()
        dress_image.save(dress_img_bytes, format='PNG')
        dress_img_bytes.seek(0)
        
        # Create the prompt for virtual try-on
        prompt = """
        Create a realistic virtual try-on image by seamlessly overlaying the dress from the second image onto the person in the first image. 
        The dress should fit naturally on the person's body, maintaining proper proportions and realistic shadows. 
        Ensure the person's pose, lighting, and background remain consistent while the dress replaces their current clothing.
        Make the result look natural and professional, as if the person is actually wearing the dress.
        """
        
        # Generate the try-on image using OpenAI's image edit API
        result = openai_client.images.edit(
            model="gpt-image-1",
            image=[user_img_bytes, dress_img_bytes],
            prompt=prompt,
            size="1024x1536",  # Portrait format for try-on
            quality="high"
        )
        
        # Return the base64 encoded result
        return result.data[0].b64_json
        
    except Exception as e:
        logger.error(f"Error generating try-on image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate try-on image: {str(e)}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Virtual Try-On API is running"}

@api_router.post("/tryon", response_model=TryOnResponse)
async def create_tryon(dress_url: str = Form(...), user_image: UploadFile = File(...)):
    """Create a virtual try-on image"""
    try:
        # Read and validate user image
        user_image_data = await user_image.read()
        user_img = Image.open(io.BytesIO(user_image_data))
        user_img_base64 = image_to_base64(user_img)
        
        # Download dress image
        dress_img_base64 = await download_image_as_base64(dress_url)
        dress_img = base64_to_image(dress_img_base64)
        
        # Generate try-on image
        generated_img_base64 = await generate_tryon_image(user_img, dress_img)
        
        # Create try-on record
        tryon_data = {
            "id": str(uuid.uuid4()),
            "dress_url": dress_url,
            "original_image_data": user_img_base64,
            "generated_image_data": generated_img_base64,
            "timestamp": datetime.utcnow(),
            "status": "completed"
        }
        
        # Save to database
        await db.tryons.insert_one(tryon_data)
        
        return TryOnResponse(**tryon_data)
        
    except Exception as e:
        logger.error(f"Error creating try-on: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create try-on: {str(e)}")

@api_router.get("/tryon/{tryon_id}/base64")
async def get_tryon_image_base64(tryon_id: str):
    """Get try-on image as base64 data"""
    try:
        tryon = await db.tryons.find_one({"id": tryon_id})
        if not tryon:
            raise HTTPException(status_code=404, detail="Try-on not found")
        
        return {
            "id": tryon_id,
            "generated_image_data": tryon["generated_image_data"],
            "original_image_data": tryon["original_image_data"]
        }
        
    except Exception as e:
        logger.error(f"Error getting try-on image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get try-on image: {str(e)}")

@api_router.get("/tryons", response_model=List[TryOnResponse])
async def get_tryons():
    """Get all try-on records"""
    try:
        tryons = await db.tryons.find().sort("timestamp", -1).to_list(100)
        return [TryOnResponse(**tryon) for tryon in tryons]
    except Exception as e:
        logger.error(f"Error getting try-ons: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get try-ons: {str(e)}")

@api_router.post("/feedback", response_model=FeedbackResponse)
async def create_feedback(feedback: FeedbackRequest):
    """Create feedback for a try-on"""
    try:
        feedback_data = feedback.dict()
        await db.feedback.insert_one(feedback_data)
        return FeedbackResponse(**feedback_data)
    except Exception as e:
        logger.error(f"Error creating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create feedback: {str(e)}")

@api_router.get("/feedback/{tryon_id}")
async def get_feedback(tryon_id: str):
    """Get feedback for a specific try-on"""
    try:
        feedback_list = await db.feedback.find({"tryon_id": tryon_id}).to_list(100)
        return [FeedbackResponse(**feedback) for feedback in feedback_list]
    except Exception as e:
        logger.error(f"Error getting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get feedback: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()