from fastapi import APIRouter, Body, HTTPException
from services.sd_service import generate_image

router = APIRouter()

@router.post("/image")
def create_image(prompt: str = Body(..., embed=True)):
    try:
        image_url = generate_image(prompt)
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
