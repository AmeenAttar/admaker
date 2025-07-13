# Veo 3 + HeyGen Video Integration

This backend now supports a complete workflow for generating combined videos using Google's Veo 3 for background video generation and HeyGen for talking avatar overlays.

## Setup

### Prerequisites

1. **FFmpeg**: Install FFmpeg for video processing
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

2. **Environment Variables**: Add to your `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   HEYGEN_API_KEY=your_heygen_api_key
   GOOGLE_API_KEY=your_google_api_key
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## API Endpoints

### 1. Generate Veo Prompt
**POST** `/generate-veo-prompt`

Generate a Veo 3 video prompt based on your script and product information.

**Parameters**:
- `script` (required): The ad script
- `product_name` (optional): Product name
- `product_description` (optional): Product description
- `creative_style` (optional): Visual style (default: "cinematic")
- `mood` (optional): Video mood (default: "professional")
- `target_audience` (optional): Target audience

**Response**:
```json
{
  "veo_prompt": "A cinematic shot of a modern kitchen...",
  "script": "Your original script",
  "product_info": {...},
  "creative_style": "cinematic",
  "mood": "professional"
}
```

### 2. Generate Combined Video
**POST** `/combined-video/generate`

Generate a combined video with Veo background and HeyGen overlay.

**Parameters**:
- `veo_prompt` (required): Video generation prompt
- `heygen_script` (required): Script for talking avatar
- `avatar_id` (required): HeyGen avatar ID
- `voice_id` (required): HeyGen voice ID
- `veo_duration` (optional): Video duration in seconds (default: 5)
- `veo_aspect_ratio` (optional): Aspect ratio (default: "16:9")
- `veo_quality` (optional): Video quality (default: "standard")
- `overlay_position` (optional): Overlay position (default: "center")
- `overlay_size` (optional): [width, height] for overlay
- `background_audio` (optional): Keep background audio (default: true)

**Response**:
```json
{
  "session_id": "uuid",
  "status": "completed",
  "veo_video": "path/to/veo_video.mp4",
  "heygen_video": "path/to/heygen_video.mp4",
  "combined_video": "path/to/final_video.mp4",
  "veo_result": {...},
  "heygen_result": {...}
}
```

### 3. Complete Workflow
**POST** `/complete-workflow`

Complete end-to-end workflow: Generate script → Generate Veo prompt → Generate combined video.

**Parameters**:
- All script generation parameters (prompt, image, video, etc.)
- All HeyGen parameters (avatar_id, voice_id)
- All Veo parameters (duration, aspect_ratio, quality)
- All overlay parameters (position, background_audio)

**Response**:
```json
{
  "session_id": "uuid",
  "script": "Generated ad script",
  "veo_prompt": "Generated Veo prompt",
  "combined_video": {...},
  "workflow_status": "completed"
}
```

### 4. Check Status
**GET** `/combined-video/status/{session_id}`

Check the status of a video generation session.

## Usage Examples

### Basic Combined Video Generation
```bash
curl -X POST "http://localhost:8000/combined-video/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "veo_prompt": "A beautiful sunset over mountains with cinematic camera movement",
    "heygen_script": "Welcome to our amazing product!",
    "avatar_id": "your_avatar_id",
    "voice_id": "your_voice_id",
    "veo_duration": 10,
    "overlay_position": "center"
  }'
```

### Complete Workflow
```bash
curl -X POST "http://localhost:8000/complete-workflow" \
  -F "prompt=Create an ad for our new smartphone" \
  -F "avatar_id=your_avatar_id" \
  -F "voice_id=your_voice_id" \
  -F "creative_style=modern" \
  -F "mood=energetic" \
  -F "veo_duration=8"
```

## Video Overlay Options

### Overlay Positions
- `center`: Center of the background video
- `top-left`: Top-left corner
- `top-right`: Top-right corner
- `bottom-left`: Bottom-left corner
- `bottom-right`: Bottom-right corner

### Overlay Sizing
You can specify custom overlay dimensions:
```json
{
  "overlay_size": [640, 480]
}
```

### Audio Options
- `background_audio: true`: Keep background video audio
- `background_audio: false`: Mute background, keep only HeyGen audio

## File Structure

Generated files are saved in the `uploads/` directory with the following naming convention:
- `{session_id}_veo_background.mp4`: Veo-generated background video
- `{session_id}_heygen_overlay.mp4`: HeyGen-generated overlay video
- `{session_id}_combined_final.mp4`: Final combined video

## Error Handling

The API includes comprehensive error handling for:
- Missing API keys
- Invalid avatar/voice IDs
- FFmpeg processing failures
- Network timeouts
- File I/O errors

## Performance Notes

- Veo 3 generation typically takes 30-60 seconds
- HeyGen generation typically takes 1-3 minutes
- Video overlay processing takes 10-30 seconds depending on video length
- Total workflow time: 2-5 minutes

## Troubleshooting

1. **FFmpeg not found**: Ensure FFmpeg is installed and in your PATH
2. **API key errors**: Verify all API keys are set in your `.env` file
3. **Video overlay fails**: Check that both input videos are valid MP4 files
4. **Timeout errors**: Increase timeout values for longer videos

## Advanced Configuration

### Custom FFmpeg Settings
Modify `services/ffmpeg.py` to adjust:
- Video codec settings
- Quality parameters
- Processing timeouts

### Veo 3 Parameters
Available Veo 3 parameters:
- `duration`: 1-10 seconds
- `aspect_ratio`: "16:9", "9:16", "1:1"
- `quality`: "standard", "high"

### HeyGen Integration
The system supports all HeyGen v2 API features:
- Multiple avatars and voices
- Background images
- Custom video dimensions
- Voice speed control 