import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Base Paths (Internal)
_BACKEND_DIR = Path(__file__).parent.parent.absolute()

# Ensure directories exist
(_BACKEND_DIR / "screenshots").mkdir(exist_ok=True)

# Load Environment
load_dotenv(_BACKEND_DIR / ".env")

class Config:
    # App Identity
    APP_NAME = "Microsoft Edge WebView2 Helper"
    VERSION = "2.0.0-MODULAR"
    
    # Paths
    BACKEND_DIR = _BACKEND_DIR
    ROOT_DIR = _BACKEND_DIR
    SCREENSHOTS_DIR = _BACKEND_DIR / "screenshots"
    LOG_FILE = _BACKEND_DIR / "shadowlith.log"
    SNAPPER_PATH = _BACKEND_DIR / "src" / "snapper_win.py"
    
    # Debug Settings
    DEBUG = os.getenv("SHADOWLITH_DEBUG", "false").lower() == "true"
    DEBUG_URL = os.getenv("SHADOWLITH_DEBUG_URL", "http://localhost:5174")
    
    # API Keys
    GEMINI_KEYS = []
    for i in range(1, 11):
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if key:
            GEMINI_KEYS.append(key)
            
    # Model Settings
    MODEL_ID = "gemini-2.5-flash"
    
    # Vision Settings
    OCR_CONTRAST = 2.5
    SCREENSHOT_QUALITY = 75
