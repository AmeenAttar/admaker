import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_ad_script(prompt: str) -> str:
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert ad copywriter."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

def generate_image_prompt(user_input: str, style: str = "realistic", tone: str = "professional", model: str = "gpt-3.5-turbo") -> str:
    """
    Generate an optimized image prompt using GPT (default: gpt-3.5-turbo) based on user input.
    
    Args:
        user_input: User's description of what they want
        style: Visual style (realistic, artistic, minimalist, etc.)
        tone: Tone/mood (professional, fun, luxury, etc.)
        model: OpenAI model to use (default: gpt-3.5-turbo)
    """
    system_prompt = """You are an expert at creating detailed, optimized image generation prompts. 
    Your task is to transform user descriptions into highly detailed prompts that will generate 
    professional, high-quality images suitable for advertising and marketing.
    
    Guidelines:
    - Be specific about composition, lighting, colors, and mood
    - Include relevant details about product placement and context
    - Ensure the prompt is clear and actionable for image generation
    - Focus on visual elements that will make the image compelling
    - Keep the prompt under 1000 characters for optimal results
    - Avoid overly complex or conflicting instructions
    
    Return only the optimized prompt, nothing else."""
    
    user_prompt = f"""
    Create an optimized image generation prompt for:
    User description: {user_input}
    Style: {style}
    Tone: {tone}
    
    Make it detailed and specific for professional image generation.
    """
    
    response = openai.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=500,
        temperature=0.7,
    )
    
    return response.choices[0].message.content.strip()