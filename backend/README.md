# Backend Setup

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_KEY_IMG=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
HEYGEN_API_KEY=your_heygen_api_key_here
```

## Installation

1. Install dependencies:
```bash
pip install openai fastapi python-multipart httpx python-dotenv uvicorn
```

2. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /image` - Generate image with direct prompt
- `POST /image/optimized` - Generate image with GPT-4 optimized prompt
- `POST /script` - Generate ad script
- `POST /voice` - Generate voiceover
- `POST /video/generate` - Generate talking avatar video
- `GET /video/avatars` - Get available avatars
- `GET /video/voices` - Get available voices
- `GET /video/status/{video_id}` - Get video generation status
- `GET /health` - Health check

## Features

- **AI-Powered Image Generation**: Uses ChatGPT 4.0 to optimize image prompts based on user input
- **GPT-Image-1 Integration**: Generates high-quality images with customizable styles and tones
- **Multiple Image Sizes**: Support for square, landscape, and portrait formats
- **Quality Options**: Support for low, medium, high, and auto quality settings
- **Style and Tone Control**: Fine-tune the visual style and mood of generated images
- **Talking Avatar Videos**: Generate professional talking avatar videos with HeyGen API
- **Voice Generation**: Create realistic voiceovers with ElevenLabs
- **Script Generation**: AI-powered ad script creation with ChatGPT 