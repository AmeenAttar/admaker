import subprocess
import os
import tempfile
from typing import Optional, Tuple

class FFmpegService:
    @staticmethod
    def overlay_videos(
        background_video_path: str,
        overlay_video_path: str,
        output_path: str,
        overlay_position: str = "center",
        overlay_size: Optional[Tuple[int, int]] = None,
        background_audio: bool = True
    ) -> bool:
        """
        Overlay a video on top of another video using FFmpeg.
        
        Args:
            background_video_path: Path to the background video (Veo generated)
            overlay_video_path: Path to the overlay video (HeyGen generated)
            output_path: Path for the output video
            overlay_position: Position of overlay ('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right')
            overlay_size: Optional tuple (width, height) to resize overlay
            background_audio: Whether to keep background video audio
        """
        try:
            # Get video dimensions
            bg_width, bg_height = FFmpegService._get_video_dimensions(background_video_path)
            overlay_width, overlay_height = FFmpegService._get_video_dimensions(overlay_video_path)
            
            # Calculate overlay position
            x, y = FFmpegService._calculate_position(
                overlay_position, bg_width, bg_height, overlay_width, overlay_height
            )
            
            # Build FFmpeg command
            cmd = [
                "ffmpeg", "-y",  # Overwrite output file
                "-i", background_video_path,
                "-i", overlay_video_path,
                "-filter_complex", FFmpegService._build_filter_complex(
                    x, y, overlay_size, background_audio
                ),
                "-c:a", "aac" if background_audio else "an",
                output_path
            ]
            
            # Execute FFmpeg command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode != 0:
                print(f"FFmpeg error: {result.stderr}")
                return False
                
            return True
            
        except Exception as e:
            print(f"Video overlay failed: {str(e)}")
            return False
    
    @staticmethod
    def _get_video_dimensions(video_path: str) -> Tuple[int, int]:
        """Get video width and height using FFprobe."""
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=p=0",
                video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"FFprobe failed: {result.stderr}")
            
            dimensions = result.stdout.strip().split(',')
            return int(dimensions[0]), int(dimensions[1])
            
        except Exception as e:
            raise Exception(f"Failed to get video dimensions: {str(e)}")
    
    @staticmethod
    def _calculate_position(
        position: str,
        bg_width: int,
        bg_height: int,
        overlay_width: int,
        overlay_height: int
    ) -> Tuple[int, int]:
        """Calculate overlay position coordinates."""
        if position == "center":
            x = (bg_width - overlay_width) // 2
            y = (bg_height - overlay_height) // 2
        elif position == "top-left":
            x = 0
            y = 0
        elif position == "top-right":
            x = bg_width - overlay_width
            y = 0
        elif position == "bottom-left":
            x = 0
            y = bg_height - overlay_height
        elif position == "bottom-right":
            x = bg_width - overlay_width
            y = bg_height - overlay_height
        else:
            x = (bg_width - overlay_width) // 2
            y = (bg_height - overlay_height) // 2
        
        return max(0, x), max(0, y)
    
    @staticmethod
    def _build_filter_complex(
        x: int,
        y: int,
        overlay_size: Optional[Tuple[int, int]],
        background_audio: bool
    ) -> str:
        """Build FFmpeg filter complex string."""
        filters = []
        
        # Scale overlay if size specified
        if overlay_size:
            filters.append(f"[1:v]scale={overlay_size[0]}:{overlay_size[1]}[overlay_scaled]")
            overlay_input = "[overlay_scaled]"
        else:
            overlay_input = "[1:v]"
        
        # Overlay filter
        filters.append(f"[0:v]{overlay_input}overlay={x}:{y}[v]")
        
        # Audio handling
        if background_audio:
            filters.append("[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a]")
        
        # Output mapping
        output_mapping = "[v]"
        if background_audio:
            output_mapping += "[a]"
        
        return ";".join(filters) + f";{output_mapping}"
    
    @staticmethod
    def resize_video(
        input_path: str,
        output_path: str,
        width: int,
        height: int
    ) -> bool:
        """Resize a video to specified dimensions."""
        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-vf", f"scale={width}:{height}",
                "-c:a", "copy",
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            return result.returncode == 0
            
        except Exception as e:
            print(f"Video resize failed: {str(e)}")
            return False
    
    @staticmethod
    def extract_audio(input_path: str, output_path: str) -> bool:
        """Extract audio from video."""
        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-vn",
                "-acodec", "mp3",
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            return result.returncode == 0
            
        except Exception as e:
            print(f"Audio extraction failed: {str(e)}")
            return False
