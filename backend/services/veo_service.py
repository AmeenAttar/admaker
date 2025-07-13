import os
import httpx
import base64
import time
from dotenv import load_dotenv
from typing import Optional, Dict, Any

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
VEO_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/veo-3:generateContent"

class VeoService:
    def __init__(self):
        self.api_key = GOOGLE_API_KEY
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.base_url = f"{VEO_BASE_URL}?key={self.api_key}"
    
    def generate_video(
        self,
        prompt: str,
        duration: int = 5,
        aspect_ratio: str = "16:9",
        quality: str = "standard"
    ) -> Dict[str, Any]:
        """
        Generate a video using Google's Veo 3 API.
        """
        request_data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "videoDuration": f"{duration}s",
                "aspectRatio": aspect_ratio,
                "quality": quality
            }
        }
        
        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(
                    self.base_url,
                    json=request_data
                )
                response.raise_for_status()
                result = response.json()
                
                if "error" in result:
                    raise Exception(f"Veo API error: {result['error']}")
                
                if "candidates" not in result or not result["candidates"]:
                    raise Exception("No video generated")
                
                video_data = result["candidates"][0]["content"]["parts"][0]
                
                if "inlineData" not in video_data:
                    raise Exception("No video data in response")
                
                video_bytes = base64.b64decode(video_data["inlineData"]["data"])
                
                return {
                    "status": "completed",
                    "video_data": video_bytes,
                    "mime_type": video_data["inlineData"]["mimeType"],
                    "duration": duration,
                    "aspect_ratio": aspect_ratio,
                    "quality": quality
                }
                
        except Exception as e:
            raise Exception(f"Veo video generation failed: {str(e)}")

def generate_veo_video(prompt: str, duration: int = 5, aspect_ratio: str = "16:9", quality: str = "standard") -> Dict[str, Any]:
    service = VeoService()
    return service.generate_video(prompt, duration, aspect_ratio, quality) 