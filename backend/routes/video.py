from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.heygen_service import HeyGenService, create_talking_avatar_video

router = APIRouter()

class VideoGenerationRequest(BaseModel):
    script: str
    avatar_id: Optional[str] = None
    voice_id: Optional[str] = None
    background_url: Optional[str] = None
    video_format: Optional[str] = "mp4"

class AvatarListResponse(BaseModel):
    avatars: List[dict]

class VoiceListResponse(BaseModel):
    voices: List[dict]

@router.post("/video/generate")
def generate_talking_avatar_video(request: VideoGenerationRequest):
    """
    Generate a talking avatar video using HeyGen API.
    """
    if not request.avatar_id:
        raise HTTPException(status_code=400, detail="avatar_id is required")
    
    if not request.voice_id:
        raise HTTPException(status_code=400, detail="voice_id is required")
    
    try:
        result = create_talking_avatar_video(
            script=request.script,
            avatar_id=request.avatar_id,
            voice_id=request.voice_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/video/avatars")
def get_available_avatars():
    """
    Get list of available avatars from HeyGen.
    """
    try:
        service = HeyGenService()
        avatars = service.get_available_avatars()
        return {"avatars": avatars}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/video/voices")
def get_available_voices():
    """
    Get list of available voices from HeyGen.
    """
    try:
        service = HeyGenService()
        voices = service.get_available_voices()
        return {"voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/video/status/{video_id}")
def get_video_status(video_id: str):
    """
    Get the status of a video generation task.
    """
    try:
        service = HeyGenService()
        status = service._poll_video_status(video_id, max_attempts=1)  # Just check once
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
