# backend/services/video_frame.py
import cv2

def extract_first_frame(video_path: str, output_path: str) -> str:
    vidcap = cv2.VideoCapture(video_path)
    success, image = vidcap.read()
    if success:
        cv2.imwrite(output_path, image)
        return output_path
    return None
