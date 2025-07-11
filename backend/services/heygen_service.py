import os
import httpx
import base64
import time
from dotenv import load_dotenv
from typing import Optional, Dict, Any

load_dotenv()
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
HEYGEN_BASE_URL = "https://api.heygen.com/v2"

class HeyGenService:
    def __init__(self):
        self.api_key = HEYGEN_API_KEY
        if not self.api_key:
            raise ValueError("HEYGEN_API_KEY environment variable is required")
        
        self.headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def create_talking_avatar_video(
        self,
        script: str,
        avatar_id: str = None,  # No default avatar
        voice_id: str = None,  # No default voice
        background_url: Optional[str] = None,
        video_format: str = "mp4"
    ) -> Dict[str, Any]:
        """
        Create a talking avatar video using HeyGen API (v2).
        """
        task_data = {
            "video_inputs": [
                {
                    "character": {
                        "type": "avatar",
                        "avatar_id": avatar_id,
                        "avatar_style": "normal",
                        "input_text": script,
                    },
                    "voice": {
                        "type": "text",
                        "input_text": script,
                        "voice_id": voice_id,
                        "speed": 1.0
                    }
                }
            ],
            "dimension": {
                "width": 1280,
                "height": 720
            }
        }
        if background_url:
            task_data["video_inputs"][0]["character"]["background"] = {
                "type": "image",
                "url": background_url
            }
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    f"{HEYGEN_BASE_URL}/video/generate",
                    headers=self.headers,
                    json=task_data
                )
                if response.status_code != 200:
                    print("HeyGen API error response:", response.status_code, response.text)
                response.raise_for_status()
                task_result = response.json()
                if task_result.get("error") is not None:
                    raise Exception(f"HeyGen API error: {task_result['error']}")
                video_id = task_result["data"]["video_id"]
                return self._poll_video_status(video_id)
        except Exception as e:
            raise Exception(f"HeyGen video creation failed: {str(e)}")
    
    def _poll_video_status(self, video_id: str, max_attempts: int = 60) -> Dict[str, Any]:
        for attempt in range(max_attempts):
            try:
                with httpx.Client(timeout=10.0) as client:
                    response = client.get(
                        f"https://api.heygen.com/v1/video_status.get?video_id={video_id}",
                        headers=self.headers
                    )
                    response.raise_for_status()
                    status_result = response.json()
                    if status_result.get("code") != 100:
                        raise Exception(f"HeyGen API error: {status_result.get('message', 'Unknown error')}")
                    data = status_result["data"]
                    status = data.get("status")
                    if status == "completed":
                        return {
                            "video_id": video_id,
                            "status": "completed",
                            "video_url": data.get("video_url"),
                            "duration": data.get("duration"),
                            "thumbnail_url": data.get("thumbnail_url")
                        }
                    elif status == "failed":
                        raise Exception(f"Video generation failed: {data.get('error', {}).get('message', 'Unknown error')}")
                    elif status in ["pending", "processing", "waiting"]:
                        time.sleep(5)
                        continue
                    else:
                        raise Exception(f"Unknown video status: {status}")
            except Exception as e:
                if attempt == max_attempts - 1:
                    raise e
                time.sleep(5)
        raise Exception("Video generation timed out")
    
    def get_available_avatars(self) -> list:
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(
                    f"{HEYGEN_BASE_URL}/avatars",
                    headers=self.headers
                )
                response.raise_for_status()
                result = response.json()
                if result.get("error") is not None:
                    raise Exception(f"HeyGen API error: {result['error']}")
                return result["data"]["avatars"]
        except Exception as e:
            raise Exception(f"Failed to get avatars: {str(e)}")
    
    def get_available_voices(self) -> list:
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(
                    f"{HEYGEN_BASE_URL}/voices",
                    headers=self.headers
                )
                response.raise_for_status()
                result = response.json()
                if result.get("error") is not None:
                    raise Exception(f"HeyGen API error: {result['error']}")
                return result["data"]["voices"]
        except Exception as e:
            raise Exception(f"Failed to get voices: {str(e)}")

def create_talking_avatar_video(script: str, avatar_id: str = None, voice_id: str = None) -> Dict[str, Any]:
    service = HeyGenService()
    return service.create_talking_avatar_video(script, avatar_id, voice_id) 