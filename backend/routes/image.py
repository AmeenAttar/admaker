from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.sd_service import generate_image, generate_image_with_prompt_optimization

router = APIRouter()

class ImageRequest(BaseModel):
    prompt: str
    size: Optional[str] = "1024x1024"
    quality: Optional[str] = "standard"

class OptimizedImageRequest(BaseModel):
    user_input: str
    style: Optional[str] = "realistic"
    tone: Optional[str] = "professional"
    size: Optional[str] = "1024x1024"

@router.post("/image")
def create_image(request: ImageRequest):
    try:
        image_url = generate_image(request.prompt, request.size, request.quality)
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image/optimized")
def create_optimized_image(request: OptimizedImageRequest):
    try:
        result = generate_image_with_prompt_optimization(
            request.user_input,
            request.style,
            request.tone,
            request.size
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
