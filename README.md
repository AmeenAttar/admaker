🔧 Overview: AI AdMaker Web App

🚀 **NEW: AI-Powered Image Generation**
* ChatGPT 4.0 optimizes your image descriptions into professional prompts
* GPT-Image-1 generates high-quality images with customizable styles and tones
* Support for multiple aspect ratios (square, landscape, portrait)
* **Two-step process: Generate prompt → Edit → Generate image**
* **The existing "Generate Ad Image" button now uses AI optimization!**
* **Upgraded to GPT-Image-1 (replaces DALL-E 3) for next-gen image generation**

🎬 **NEW: Talking Avatar Video Generation**
* HeyGen API integration for professional talking avatar videos
* Lip-sync technology with realistic avatars
* Multiple avatar options and voice integration
* Complete ad workflow: Script → Voice → Video

✅ Goals Recap:
* Users upload product name, images, text, optional voice.
* Choose ad type: static image, poster, video with face/voice.
* Choose tone, style, aspect ratio (e.g., 16:9, 9:16).
* App guides user step-by-step:
    1. Generate script (copywriting)
    2. Generate voice (voiceover)
    3. Create visual (image/video) - **Now with AI prompt optimization in 3 steps!**
    4. Combine into polished final ad
* Future: pre-made faces, voices, styles/templates.
* Platform: Web-based, mobile-friendly, cross-platform output (Instagram, TikTok, YouTube, etc.)

🧠 Core Tech Stack
1. Ad Script Generation (Copywriting)
Tool	Description	Notes
OpenAI GPT-4 API	Generate headline, hook, CTA, body copy	Most fluent, can generate style/tone variations
Anthropic Claude 3	Great for brand-safe, long-form generation	Optional, similar to GPT
Prompt Engineering	Offer tone options like "Luxury," "Funny," "Edgy"	Use dropdown + pre-filled prompt templates
Optional: LangChain	If you want multi-step workflows with memory	Good for chaining script ➝ voice ➝ video
✅ Build dynamic prompts from user input + selected tone, ad type, etc.

2. Text-to-Speech (Voiceover)
Tool	Description	Notes
ElevenLabs API	Most realistic voices, clone or choose existing	Real-time, emotion control, top choice
PlayHT	Web-friendly, realistic, supports many styles	Good alt
Coqui TTS (Open Source)	Free, customizable, self-host	Less realistic, but flexible
Amazon Polly	Cheap & scalable but robotic	Good for fallback or basic use cases
✅ Let user pick a voice from 5–10 presets. Generate MP3 from script.

3. Image / Poster Ad Generation
Tool	Description	Notes
GPT-Image-1 (OpenAI)	Generate product/scene/poster layouts	Use via OpenAI API, next-gen multimodal model
Stable Diffusion (SDXL)	Fully customizable, can run locally	Ideal for branded visuals
Midjourney (via Discord)	Great for stylized, artistic images	Not API-friendly yet
Canva API (or plugin)	Use for layout / templates	Add text layers & designs on top of AI art
✅ Use uploaded product image + prompt + branding tone for poster creation.

4. Video Generation (with Voice, Face, Product)
Option A: API-based video generation (No-Code Backbones)
Tool	Description	Notes
HeyGen API	Talking avatar + face + voice = ad	Ideal for talking-head style ads
Synthesia API	More corporate, expensive, still great	Use for serious/luxury tones
RunwayML GEN-3	AI-generated cinematic clips	Add voice later via editor
Pika Labs	Motion graphics + animated AI content	Closed beta, but useful when open
✅ Upload voice, choose template/avatar, auto-generate ad.
Option B: DIY Pipeline (More Control)
* Use Stable Diffusion or product images to make frames.
* Add voice via FFmpeg + Wav2Lip (for lip-sync).
* Animate still images via Kaiber, RunwayML, or DeepMotion.
* Combine visuals & audio with MoviePy or FFmpeg.

5. Video Assembly & Editing (Final Output)
Tool	Description
MoviePy (Python)	Build timelines, add text/audio
FFmpeg (CLI)	Precise trimming, resolution/aspect ratio conversion
CapCut API (future)	Mobile-first editing (not public yet)
Remotion (React)	React-based video rendering (dev-friendly!)
✅ Build the ad as final MP4: image/video + voice + text overlay.

6. Frontend & Backend
Frontend
Tool	Purpose
Next.js (React)	Core web app
Tailwind CSS	Clean, fast UI building
shadcn/ui	Great components for toggles, dropdowns
Framer Motion	Smooth animations for UX
Backend
Tool	Purpose
FastAPI (Python)	Talk to AI models (text, voice,


🎬 Ad Script Formats (by medium & duration)

15‑second spot – Very short burst: brand/product intro, quick hook, ending with CTA. Ideal for social or TV where brevity matters. 
Wikipedia
+2
Fall Off The Wall
+2
viewfinder.vn
+2
30‑second spot – Standard commercial length. Enables a basic narrative (problem → solution → CTA), most commonly purchased time slot.
60‑second (or longer) – Infomercial or longer-form storytelling. Useful when you need explanation or emotion-building. 

🧠 Creative Strategy / Tone Presets

From advertising strategy frameworks (IAB, marketing standard typologies), here are creative “angles” or tones that shape how a script is written:

Informational / Generic – Straightforward description or category messaging; best for new products/categories.
Unique Selling Proposition (USP) – Focuses on one standout feature/benefit that matters to consumers.
Comparative – Direct comparison vs. competitor(s)—used cautiously to avoid legal or backlash.
Transformational – Emotional appeal that portrays how the product changes a consumer’s life.
Brand‑image / Lifestyle – Associates product with a desired lifestyle, identity, or status.
Use‑occasion – Frames product around a specific use‑case or moment (e.g., “for your morning commute”).
🚀 Common Creative Execution Styles (Delivery Style / Tone)

Flashy / Energetic Promo – Fast pacing, upbeat tone, dynamic visuals or punchy audio. Great for impulse buys or social ads.
Story‑driven / Narrative – Build an emotional journey: character, conflict, resolution using the product.
Host‑read / Endorsement style – Especially radio or podcast ads: a familiar voice or influencer gives a personal recommendation.
Demo or Tutorial – Product in action with walkthrough or explanation (common for tech or complex products).
Jingle / Musical hook – Uses music, slogan or rhyme to boost recall (think jingles or catchy slogans).