
from faster_whisper import WhisperModel
import os

print("Testing Whisper Load...")
try:
    model = WhisperModel(
        "tiny.en", 
        device="cpu", 
        compute_type="int8",
        cpu_threads=2,
        num_workers=1
    )
    print("Success: Model Loaded.")
except Exception as e:
    print(f"Failed: {e}")
