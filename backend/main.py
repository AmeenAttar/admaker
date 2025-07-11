# backend/main.py
from fastapi import FastAPI
from routes import script
from fastapi.middleware.cors import CORSMiddleware
from routes import voice
from routes import image
from routes import video

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(script.router)

@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(voice.router)
app.include_router(image.router)
app.include_router(video.router)