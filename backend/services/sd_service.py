import os
import openai
from dotenv import load_dotenv
import base64
import io
from PIL import Image

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY_IMG")

def generate_image(prompt: str, size: str = "1024x1024", quality: str = "standard") -> str:
    """
    Generate an image using DALL-E 3 with the given prompt.
    
    Args:
        prompt: The image generation prompt
        size: Image size (1024x1024, 1792x1024, 1024x1792)
        quality: Image quality (standard, hd)
    """
    try:
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality=quality,
            n=1,
        )
        
        image_url = response.data[0].url
        
        import httpx
        with httpx.Client(timeout=30.0) as client:
            image_response = client.get(image_url)
            image_response.raise_for_status()
            image_bytes = image_response.content
            
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            return f"data:image/png;base64,{image_base64}"
            
    except Exception as e:
        raise Exception(f"DALL-E 3 image generation failed: {str(e)}")

def generate_image_with_prompt_optimization(user_input: str, style: str = "realistic", 
                                          tone: str = "professional", size: str = "1024x1024") -> dict:
    """
    Generate an image by first optimizing the prompt with GPT-3.5, then generating the image.
    
    Args:
        user_input: User's description of what they want
        style: Visual style (realistic, artistic, minimalist, etc.)
        tone: Tone/mood (professional, fun, luxury, etc.)
        size: Image size for generation
    """
    from .gpt_service import generate_image_prompt
    
    try:
        optimized_prompt = generate_image_prompt(user_input, style, tone, model="gpt-3.5-turbo")
        image_data = generate_image(optimized_prompt, size)
        
        return {
            "image_data": image_data,
            "optimized_prompt": optimized_prompt,
            "original_input": user_input
        }
    except Exception as e:
        raise Exception(f"Image generation with prompt optimization failed: {str(e)}")