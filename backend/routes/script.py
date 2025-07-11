from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import uuid
import os
from typing import Optional, List
from services.image_caption import get_image_caption
from services.video_frame import extract_first_frame
import openai
from dotenv import load_dotenv
import json

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/script")
async def generate_script(
    prompt: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    script_format: Optional[str] = Form(None),
    creative_strategy: Optional[str] = Form(None),
    execution_style: Optional[str] = Form(None)
):
    if not prompt and not image and not video and not session_id:
        raise HTTPException(status_code=400, detail="At least one input (prompt, image, video, or session_id) is required.")

    loaded_image_path = None
    loaded_video_path = None
    product_info = None
    # If session_id is provided, try to find assets and product info
    if session_id:
        for fname in os.listdir(UPLOAD_DIR):
            if fname.startswith(f"{session_id}_image_") and loaded_image_path is None:
                loaded_image_path = os.path.join(UPLOAD_DIR, fname)
            if fname.startswith(f"{session_id}_video_") and loaded_video_path is None:
                loaded_video_path = os.path.join(UPLOAD_DIR, fname)
            if fname == f"{session_id}_product.json":
                with open(os.path.join(UPLOAD_DIR, fname), "r") as f:
                    product_info = json.load(f)

    saved_files = {}
    image_caption = None
    video_caption = None

    # Uploaded image overrides loaded image
    if image:
        image_path = os.path.join(UPLOAD_DIR, f"{session_id or str(uuid.uuid4())}_image_{image.filename}")
        with open(image_path, "wb") as f:
            f.write(await image.read())
        saved_files["image"] = image_path
        try:
            image_caption = get_image_caption(image_path)
        except Exception:
            image_caption = None
    elif loaded_image_path:
        saved_files["image"] = loaded_image_path
        try:
            image_caption = get_image_caption(loaded_image_path)
        except Exception:
            image_caption = None

    # Uploaded video overrides loaded video
    if video:
        video_path = os.path.join(UPLOAD_DIR, f"{session_id or str(uuid.uuid4())}_video_{video.filename}")
        with open(video_path, "wb") as f:
            f.write(await video.read())
        saved_files["video"] = video_path
        frame_path = os.path.join(UPLOAD_DIR, f"{session_id or str(uuid.uuid4())}_frame.jpg")
        if extract_first_frame(video_path, frame_path):
            try:
                video_caption = get_image_caption(frame_path)
            except Exception:
                video_caption = None
    elif loaded_video_path:
        saved_files["video"] = loaded_video_path
        frame_path = os.path.join(UPLOAD_DIR, f"{session_id}_frame.jpg")
        if extract_first_frame(loaded_video_path, frame_path):
            try:
                video_caption = get_image_caption(frame_path)
            except Exception:
                video_caption = None

    image_files = []
    video_file = None
    voice_file = None
    if session_id:
        for fname in os.listdir(UPLOAD_DIR):
            if fname.startswith(f"{session_id}_image_"):
                image_files.append(fname.split('_', 3)[-1])
            if fname.startswith(f"{session_id}_video_") and video_file is None:
                video_file = fname.split('_', 2)[-1]
            if fname.startswith(f"{session_id}_voice_") and voice_file is None:
                voice_file = fname.split('_', 2)[-1]

    gpt_prompt = "Write an ad script."
    if product_info:
        gpt_prompt += f" Product name: {product_info.get('name', '')}."
        if product_info.get('description'):
            gpt_prompt += f" Product description: {product_info['description']}."
    # Add file names to prompt
    if image_files:
        gpt_prompt += f" Uploaded image files: {', '.join(image_files)}."
    if video_file:
        gpt_prompt += f" Uploaded video file: {video_file}."
    if voice_file:
        gpt_prompt += f" Uploaded voice file: {voice_file}."
    if prompt:
        gpt_prompt += f" Prompt: {prompt}."
    if image_caption:
        gpt_prompt += f" The product image shows: {image_caption}."
    if video_caption:
        gpt_prompt += f" The video shows: {video_caption}."
    if script_format:
        gpt_prompt += f" Script format: {script_format}."
    if creative_strategy:
        gpt_prompt += f" Creative strategy/tone: {creative_strategy}."
    if execution_style:
        gpt_prompt += f" Creative execution style: {execution_style}."

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

@router.post("/upload-product")
async def upload_product(
    name: str = Form("catnip for dogs"),
    description: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    video: Optional[UploadFile] = File(None),
    voice: Optional[UploadFile] = File(None)
):
    session_id = str(uuid.uuid4())
    saved_files = {"images": [], "video": None, "voice": None}

    if images:
        for idx, image in enumerate(images):
            image_path = os.path.join(UPLOAD_DIR, f"{session_id}_image_{idx}_{image.filename}")
            with open(image_path, "wb") as f:
                f.write(await image.read())
            saved_files["images"].append(image_path)

    if video:
        video_path = os.path.join(UPLOAD_DIR, f"{session_id}_video_{video.filename}")
        with open(video_path, "wb") as f:
            f.write(await video.read())
        saved_files["video"] = video_path

    if voice:
        voice_path = os.path.join(UPLOAD_DIR, f"{session_id}_voice_{voice.filename}")
        with open(voice_path, "wb") as f:
            f.write(await voice.read())
        saved_files["voice"] = voice_path

    # Save product info as JSON
    product_info = {"name": name, "description": description}
    product_info_path = os.path.join(UPLOAD_DIR, f"{session_id}_product.json")
    with open(product_info_path, "w") as f:
        json.dump(product_info, f)

    return JSONResponse({
        "session_id": session_id,
        "product": product_info,
        "assets": saved_files
    })