import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_ad_script(prompt: str) -> str:
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",  # or "gpt-4" if you have access
        messages=[
            {"role": "system", "content": "You are an expert ad copywriter."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()