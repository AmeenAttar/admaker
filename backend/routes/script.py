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

@router.post("/generate-veo-prompt")
async def generate_veo_prompt(
    script: str = Form(...),
    product_name: Optional[str] = Form(None),
    product_description: Optional[str] = Form(None),
    creative_style: Optional[str] = Form("cinematic"),
    mood: Optional[str] = Form("professional"),
    target_audience: Optional[str] = Form(None)
):
    """
    Generate a Veo 3 prompt for video generation based on script and product info.
    """
    gpt_prompt = f"""Generate a detailed video prompt for Google's Veo 3 AI video generator based on this ad script and product information.

Script: {script}

Product Name: {product_name or 'Not specified'}
Product Description: {product_description or 'Not specified'}
Creative Style: {creative_style}
Mood: {mood}
Target Audience: {target_audience or 'General audience'}

Create a compelling video prompt that describes the visual elements, setting, camera movements, and atmosphere that would complement this ad script. The prompt should be detailed enough for Veo 3 to generate a high-quality background video that enhances the talking avatar overlay.

Focus on:
- Visual setting and environment
- Lighting and atmosphere
- Camera movements and angles
- Color palette and mood
- Any specific visual elements that relate to the product or message

Keep the prompt under 200 words and make it highly visual and descriptive."""

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert video director and cinematographer who creates compelling visual prompts for AI video generation."},
                {"role": "user", "content": gpt_prompt}
            ],
            max_tokens=300,
            temperature=0.8,
        )
        veo_prompt = response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")

    return JSONResponse({
        "veo_prompt": veo_prompt,
        "script": script,
        "product_info": {
            "name": product_name,
            "description": product_description
        },
        "creative_style": creative_style,
        "mood": mood,
        "target_audience": target_audience
    })

@router.post("/complete-workflow")
async def complete_workflow(
    prompt: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    script_format: Optional[str] = Form(None),
    creative_strategy: Optional[str] = Form(None),
    execution_style: Optional[str] = Form(None),
    avatar_id: str = Form(...),
    voice_id: str = Form(...),
    veo_duration: Optional[int] = Form(5),
    veo_aspect_ratio: Optional[str] = Form("16:9"),
    veo_quality: Optional[str] = Form("standard"),
    overlay_position: Optional[str] = Form("center"),
    background_audio: Optional[bool] = Form(True),
    creative_style: Optional[str] = Form("cinematic"),
    mood: Optional[str] = Form("professional"),
    target_audience: Optional[str] = Form(None)
):
    """
    Complete workflow: Generate script, Veo prompt, and combined video.
    """
    if not prompt and not image and not video and not session_id:
        raise HTTPException(status_code=400, detail="At least one input (prompt, image, video, or session_id) is required.")

    # Step 1: Generate script (reuse existing logic)
    script_response = await generate_script(
        prompt=prompt,
        image=image,
        video=video,
        session_id=session_id,
        script_format=script_format,
        creative_strategy=creative_strategy,
        execution_style=execution_style
    )
    
    script_data = script_response.body.decode('utf-8')
    import json
    script_json = json.loads(script_data)
    generated_script = script_json["script"]
    
    # Get product info from session
    product_info = None
    if session_id:
        product_info_path = os.path.join(UPLOAD_DIR, f"{session_id}_product.json")
        if os.path.exists(product_info_path):
            with open(product_info_path, "r") as f:
                product_info = json.load(f)
    
    # Step 2: Generate Veo prompt
    veo_prompt_response = await generate_veo_prompt(
        script=generated_script,
        product_name=product_info.get("name") if product_info else None,
        product_description=product_info.get("description") if product_info else None,
        creative_style=creative_style,
        mood=mood,
        target_audience=target_audience
    )
    
    veo_prompt_data = veo_prompt_response.body.decode('utf-8')
    veo_prompt_json = json.loads(veo_prompt_data)
    generated_veo_prompt = veo_prompt_json["veo_prompt"]
    
    # Step 3: Generate combined video
    from routes.combined_video import generate_combined_video_with_script
    
    combined_video_response = await generate_combined_video_with_script(
        veo_prompt=generated_veo_prompt,
        script=generated_script,
        avatar_id=avatar_id,
        voice_id=voice_id,
        veo_duration=veo_duration,
        veo_aspect_ratio=veo_aspect_ratio,
        veo_quality=veo_quality,
        overlay_position=overlay_position,
        background_audio=background_audio
    )
    
    return JSONResponse({
        "session_id": script_json.get("session_id"),
        "script": generated_script,
        "veo_prompt": generated_veo_prompt,
        "combined_video": combined_video_response,
        "workflow_status": "completed"
    })