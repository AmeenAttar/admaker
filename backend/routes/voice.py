from fastapi import APIRouter, Body, HTTPException
from services.tts_service import text_to_speech
import openai
import os
from dotenv import load_dotenv
import base64
from typing import Optional

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

def script_to_voice_text(script: str) -> str:
    prompt = (
        "Rewrite the following ad script as a natural, concise, and engaging spoken ad copy, "
        "removing all directions, cues, and non-dialogue elements. Only output the text that should be spoken aloud.\n\n" + script
    )
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert ad copywriter and voiceover script editor."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

@router.post("/voice")
def generate_voice(
    script: str = Body(..., embed=True),
    voice_id: Optional[str] = Body(None, embed=True)
):
    try:
        voice_text = script_to_voice_text(script)
        if not voice_text:
            raise ValueError("No voice text generated from script.")
        audio_bytes = text_to_speech(voice_text, voice_id)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {"voice_text": voice_text, "audio_base64": audio_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))