import os
import httpx
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def generate_image(prompt: str) -> str:
    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "dall-e-3",  # or "dall-e-2"
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024"
    }
    with httpx.Client(timeout=60.0) as client:
        response = client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["url"]