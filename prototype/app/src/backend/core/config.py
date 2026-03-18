import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Base Paths
if getattr(sys, 'frozen', False):
    # Running as a bundled .exe
    _BUNDLE_DIR = Path(sys._MEIPASS)
    _APP_DIR = Path(sys.executable).parent
else:
    # Running in development
    _BUNDLE_DIR = Path(__file__).parent.parent.absolute()
    _APP_DIR = _BUNDLE_DIR

# Ensure screenshots directory exists next to the EXE/Source
(_APP_DIR / "screenshots").mkdir(exist_ok=True)

# Load Environment from the directory where the .exe sits
load_dotenv(_APP_DIR / ".env")

class Config:
    # App Identity
    APP_NAME = "Microsoft Edge WebView2 Helper"
    VERSION = "2.0.0-MODULAR"
    
    # Paths
    BACKEND_DIR = _BUNDLE_DIR
    ROOT_DIR = _BUNDLE_DIR
    SCREENSHOTS_DIR = _APP_DIR / "screenshots"
    LOG_FILE = _APP_DIR / "shadowlith.log"
    SNAPPER_PATH = _BUNDLE_DIR / "src" / "snapper_win.py"
    
    # Debug Settings
    DEBUG = os.getenv("SHADOWLITH_DEBUG", "false").lower() == "true"
    STEALTH_MODE_ON = os.getenv("STEALTH_MODE_ON", "true").lower() == "true"
    DEBUG_URL = os.getenv("SHADOWLITH_DEBUG_URL", "http://localhost:5174")
    
    # API Keys
    GEMINI_KEYS = []
    for i in range(1, 11):
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if key:
            GEMINI_KEYS.append(key)
            
    # Model Settings (Tiered)
    GEMINI_MODELS = []
    for i in range(1, 4):
        m_id = os.getenv(f"GEMINI_MODEL_{i}")
        if m_id:
            GEMINI_MODELS.append(m_id)
    
    if not GEMINI_MODELS:
        GEMINI_MODELS = ["gemini-2.0-flash"] # Safety Default
    
    # Vision Settings
    OCR_CONTRAST = 2.5
    SCREENSHOT_QUALITY = 75
