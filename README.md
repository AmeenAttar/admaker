# AI Video Ad Generator

Create compelling video ads in minutes—powered by AI. This app automates the entire ad creation workflow: from scriptwriting, to voiceover, to image and video generation, using state-of-the-art AI services.

## 🚀 Workflow Overview

1. **Script Generation:** Describe your product, and GPT-4 crafts a persuasive ad script.
2. **Image Creation:** The script is used to generate a high-quality product image with DALL-E.
3. **Voice Synthesis:** ElevenLabs brings your script to life with realistic voiceovers.
4. **Video Production:** HeyGen combines your visuals and audio into a professional video ad.
5. **End-to-End Pipeline:** One click, and your ad is ready to share.

---

## 🛠️ Getting Started


### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ai-video-ad-generator.git
cd ai-video-ad-generator
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with your API keys:
```
OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
HEYGEN_API_KEY=your_key
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧑‍💻 Technical Overview

### Architecture

- **Backend:**  
  - Built with FastAPI (Python), the backend is organized into modular routers for each domain: script, image, voice, and video.
  - CORS is enabled for local development.
  - All AI service integrations are encapsulated in dedicated service classes, ensuring separation of concerns and easy extensibility.

- **Frontend:**  
  - Next.js 14 (TypeScript, Tailwind CSS).
  - Orchestrates the workflow by calling backend REST endpoints in sequence, handling user input, and presenting results in real time.

### AI & Model Integration

- **Script Generation:**  
  - Uses OpenAI’s GPT-3.5/4 via the `openai` Python SDK.
  - The backend dynamically constructs prompts based on user input, uploaded assets, and session context (e.g., product info, image captions).
  - The system can extract image and video captions using auxiliary models, then injects these into the LLM prompt for richer, context-aware scripts.

- **Image Generation:**  
  - DALL-E 3 (via OpenAI API) is used for product image creation.
  - Before calling DALL-E, the backend uses GPT-3.5/4 to optimize the user’s description into a highly detailed, visually specific prompt, leveraging a custom system prompt for advertising/marketing quality.
  - The backend fetches the generated image, encodes it as base64, and returns it to the frontend.

- **Voice Synthesis:**  
  - ElevenLabs API is used for text-to-speech.
  - The backend first refines the ad script using GPT-3.5/4 to remove non-dialogue elements, ensuring the voiceover is natural and concise.
  - The resulting text is sent to ElevenLabs, and the audio is returned as base64-encoded MP3.

- **Video Generation:**  
  - HeyGen API is used to generate talking avatar videos.
  - The backend constructs a payload with the script, avatar, and voice IDs, and polls the HeyGen API for video completion.
  - The video is downloaded and made available to the frontend.

### Workflow Orchestration

- The frontend triggers each step (script → image → voice → video) via REST calls.
- The backend manages session state, file uploads, and intermediate results in a secure, isolated manner.
- All AI calls are performed server-side, keeping API keys and sensitive logic out of the client.
- The system is designed for extensibility: new AI providers or workflow steps can be added by implementing new service classes and routers.

### Notable Implementation Details

- **Prompt Engineering:**  
  - Custom system prompts are used for each LLM task (scriptwriting, image prompt optimization, voiceover refinement), maximizing output quality and relevance.
  - The backend can combine user input, uploaded media, and extracted metadata to create context-rich prompts.

- **Error Handling & Reliability:**  
  - Each AI integration includes robust error handling, with clear feedback to the frontend.
  - Long-running tasks (e.g., video generation) are polled asynchronously, and results are cached for session continuity.

- **Security:**  
  - All API keys are managed via environment variables and never exposed to the client.
  - Uploaded files and generated assets are stored in isolated directories, with session-based naming to prevent collisions.

---

## 📚 API Reference

- `POST /script` — Generate ad script
- `POST /image` — Generate product image
- `POST /voice` — Create voiceover
- `POST /video/generate` — Create talking avatar
- `POST /complete-workflow` — End-to-end pipeline

Full interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## License

MIT License — see [LICENSE](LICENSE) for details.