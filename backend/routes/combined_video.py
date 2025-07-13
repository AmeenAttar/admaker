from fastapi import APIRouter, Body, HTTPException, Form, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
import httpx
from services.veo_service import VeoService
from services.heygen_service import HeyGenService
from services.ffmpeg import FFmpegService

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class CombinedVideoRequest(BaseModel):
    veo_prompt: str
    heygen_script: str
    avatar_id: str
    voice_id: str
    veo_duration: Optional[int] = 5
    veo_aspect_ratio: Optional[str] = "16:9"
    veo_quality: Optional[str] = "standard"
    overlay_position: Optional[str] = "center"
    overlay_size: Optional[List[int]] = None
    background_audio: Optional[bool] = True

@router.post("/combined-video/generate")
async def generate_combined_video(request: CombinedVideoRequest):
    """
    Generate a combined video using Veo 3 for background and HeyGen for overlay.
    """
    session_id = str(uuid.uuid4())
    
    try:
        # Step 1: Generate Veo background video
        veo_service = VeoService()
        veo_result = veo_service.generate_video(
            prompt=request.veo_prompt,
            duration=request.veo_duration,
            aspect_ratio=request.veo_aspect_ratio,
            quality=request.veo_quality
        )
        
        # Save Veo video
        veo_path = os.path.join(UPLOAD_DIR, f"{session_id}_veo_background.mp4")
        with open(veo_path, "wb") as f:
            f.write(veo_result["video_data"])
        
        # Step 2: Generate HeyGen overlay video
        heygen_service = HeyGenService()
        heygen_result = heygen_service.create_talking_avatar_video(
            script=request.heygen_script,
            avatar_id=request.avatar_id,
            voice_id=request.voice_id
        )
        
        # Download HeyGen video
        heygen_path = os.path.join(UPLOAD_DIR, f"{session_id}_heygen_overlay.mp4")
        async with httpx.AsyncClient() as client:
            response = await client.get(heygen_result["video_url"])
            response.raise_for_status()
            with open(heygen_path, "wb") as f:
                f.write(response.content)
        
        # Step 3: Overlay videos using FFmpeg
        output_path = os.path.join(UPLOAD_DIR, f"{session_id}_combined_final.mp4")
        
        overlay_size = None
        if request.overlay_size and len(request.overlay_size) == 2:
            overlay_size = tuple(request.overlay_size)
        
        success = FFmpegService.overlay_videos(
            background_video_path=veo_path,
            overlay_video_path=heygen_path,
            output_path=output_path,
            overlay_position=request.overlay_position,
            overlay_size=overlay_size,
            background_audio=request.background_audio
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Video overlay failed")
        
        return {
            "session_id": session_id,
            "status": "completed",
            "veo_video": veo_path,
            "heygen_video": heygen_path,
            "combined_video": output_path,
            "veo_result": {
                "duration": veo_result["duration"],
                "aspect_ratio": veo_result["aspect_ratio"],
                "quality": veo_result["quality"]
            },
            "heygen_result": {
                "video_id": heygen_result["video_id"],
                "duration": heygen_result["duration"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/combined-video/generate-with-script")
async def generate_combined_video_with_script(
    veo_prompt: str = Form(...),
    script: str = Form(...),
    avatar_id: str = Form(...),
    voice_id: str = Form(...),
    veo_duration: Optional[int] = Form(5),
    veo_aspect_ratio: Optional[str] = Form("16:9"),
    veo_quality: Optional[str] = Form("standard"),
    overlay_position: Optional[str] = Form("center"),
    background_audio: Optional[bool] = Form(True)
):
    """
    Generate combined video using form data (for file uploads).
    """
    session_id = str(uuid.uuid4())
    
    try:
        # Step 1: Generate Veo background video
        veo_service = VeoService()
        veo_result = veo_service.generate_video(
            prompt=veo_prompt,
            duration=veo_duration,
            aspect_ratio=veo_aspect_ratio,
            quality=veo_quality
        )
        
        # Save Veo video
        veo_path = os.path.join(UPLOAD_DIR, f"{session_id}_veo_background.mp4")
        with open(veo_path, "wb") as f:
            f.write(veo_result["video_data"])
        
        # Step 2: Generate HeyGen overlay video
        heygen_service = HeyGenService()
        heygen_result = heygen_service.create_talking_avatar_video(
            script=script,
            avatar_id=avatar_id,
            voice_id=voice_id
        )
        
        # Download HeyGen video
        heygen_path = os.path.join(UPLOAD_DIR, f"{session_id}_heygen_overlay.mp4")
        async with httpx.AsyncClient() as client:
            response = await client.get(heygen_result["video_url"])
            response.raise_for_status()
            with open(heygen_path, "wb") as f:
                f.write(response.content)
        
        # Step 3: Overlay videos using FFmpeg
        output_path = os.path.join(UPLOAD_DIR, f"{session_id}_combined_final.mp4")
        
        success = FFmpegService.overlay_videos(
            background_video_path=veo_path,
            overlay_video_path=heygen_path,
            output_path=output_path,
            overlay_position=overlay_position,
            background_audio=background_audio
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Video overlay failed")
        
        return {
            "session_id": session_id,
            "status": "completed",
            "veo_video": veo_path,
            "heygen_video": heygen_path,
            "combined_video": output_path,
            "veo_result": {
                "duration": veo_result["duration"],
                "aspect_ratio": veo_result["aspect_ratio"],
                "quality": veo_result["quality"]
            },
            "heygen_result": {
                "video_id": heygen_result["video_id"],
                "duration": heygen_result["duration"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/combined-video/status/{session_id}")
async def get_combined_video_status(session_id: str):
    """
    Get the status and files for a combined video generation session.
    """
    try:
        files = {}
        for fname in os.listdir(UPLOAD_DIR):
            if fname.startswith(session_id):
                file_path = os.path.join(UPLOAD_DIR, fname)
                files[fname] = {
                    "path": file_path,
                    "exists": os.path.exists(file_path),
                    "size": os.path.getsize(file_path) if os.path.exists(file_path) else 0
                }
        
        return {
            "session_id": session_id,
            "files": files,
            "status": "completed" if any("combined_final" in f for f in files.keys()) else "processing"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 