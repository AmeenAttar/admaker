from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import uuid
import os
from typing import Optional
from services.image_caption import get_image_caption
from services.video_frame import extract_first_frame
import openai
from dotenv import load_dotenv

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/script")
async def generate_script(
    prompt: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None)
):
    if not prompt and not image and not video:
        raise HTTPException(status_code=400, detail="At least one input (prompt, image, or video) is required.")

    session_id = str(uuid.uuid4())
    saved_files = {}
    image_caption = None
    video_caption = None

    if image:
        image_path = os.path.join(UPLOAD_DIR, f"{session_id}_image_{image.filename}")
        with open(image_path, "wb") as f:
            f.write(await image.read())
        saved_files["image"] = image_path
        try:
            image_caption = get_image_caption(image_path)
        except Exception as e:
            image_caption = None

    if video:
        video_path = os.path.join(UPLOAD_DIR, f"{session_id}_video_{video.filename}")
        with open(video_path, "wb") as f:
            f.write(await video.read())
        saved_files["video"] = video_path
        frame_path = os.path.join(UPLOAD_DIR, f"{session_id}_frame.jpg")
        if extract_first_frame(video_path, frame_path):
            try:
                video_caption = get_image_caption(frame_path)
            except Exception as e:
                video_caption = None

    # Compose the prompt for GPT
    gpt_prompt = "Write an ad script."
    if prompt:
        gpt_prompt += f" Prompt: {prompt}."
    if image_caption:
        gpt_prompt += f" The product image shows: {image_caption}."
    if video_caption:
        gpt_prompt += f" The video shows: {video_caption}."

    # Call OpenAI to generate the script
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert ad copywriter."},
                {"role": "user", "content": gpt_prompt}
            ],
            max_tokens=300,
            temperature=0.7,
        )
        script = response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

    return JSONResponse({
        "session_id": session_id,
        "script": script,
        "inputs": {
            "prompt": prompt,
            **saved_files
        },
        "image_caption": image_caption,
        "video_caption": video_caption
    })