import os
import httpx
from dotenv import load_dotenv

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Default voice, change as needed

def text_to_speech(text: str, voice_id: str = None) -> bytes:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id or ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",  # Always use Multilingual v2
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }
    with httpx.Client(timeout=60.0) as client:
        response = client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.content  # This is the audio (mp3) bytes