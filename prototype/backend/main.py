import os
import sys

# --- ALPHA STABILITY FLAGS (Must be 1st) ---
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

import webview
import threading
import time
import traceback

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.config import Config
from core.logger import logger
from bridge.router import ShadowLithAPI
from services.ai_service import AIService
from services.vision_service import VisionService
from services.window_service import WindowService
from services.audio_service import AudioService
from services.prompt_service import PromptService

def global_exception_handler(exctype, value, tb):
    """Last resort logger for unhandled exceptions."""
    err_msg = "".join(traceback.format_exception(exctype, value, tb))
    logger.critical(f"UNHANDLED EXCEPTION: {err_msg}")
    # Force log flush
    for handler in logger.handlers:
        handler.flush()

sys.excepthook = global_exception_handler

def initialize_services():
    try:
        prompt_service = PromptService()
        ai_service = AIService(prompt_service)
        vision_service = VisionService()
        window_service = WindowService()
        audio_service = AudioService()
        
        api = ShadowLithAPI(
            ai=ai_service,
            vision=vision_service,
            window=window_service,
            audio=audio_service,
            prompt=prompt_service
        )
        return api
    except Exception as e:
        logger.error(f"Service Init Failed: {e}")
        logger.error(traceback.format_exc())
        return None

def start_app():
    logger.info(f"\n\n--- ShadowLith Logging Initialized (Debug: {Config.DEBUG}) ---")
    logger.info(f"Launching ShadowLith {Config.VERSION}...")
    
    api = initialize_services()
    if not api: return

    # Determine Frontend URL
    if getattr(sys, 'frozen', False):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    ui_file = os.path.join(base_dir, "ui", "index.html")
    
    if Config.DEBUG:
        url = Config.DEBUG_URL
        logger.info(f"UI SOURCE: Development Port ({url})")
    elif os.path.exists(ui_file):
        url = ui_file
        logger.info(f"UI SOURCE: Production Build ({url})")
    else:
        url = "http://localhost:5174"
        logger.warning(f"UI SOURCE: Fallback detected ({url})")

    # Create Window
    window = webview.create_window(
        Config.APP_NAME,
        url,
        width=1200,
        height=850,
        frameless=True,
        transparent=True,
        on_top=True,
        js_api=api,
        background_color='#030303' # Prevent white flash
    )
    
    api.set_window(window)

    def on_window_ready():
        """Safe staggered initialization after window is active."""
        def boot_routine():
            try:
                # 1. Wait for QT engine to settle
                time.sleep(2.0) 
                
                # 2. Get native handle and apply styles
                _hwnd = api.window.get_hwnd()
                if _hwnd:
                    logger.info(f"System: Optimizing Native Window [HWND: {_hwnd}]")
                    api.window.apply_stealth(_hwnd)
                    api.window.set_ghost_style(interactive=True, hwnd=_hwnd)
                    
                # 3. Synchronize initial counters safely
                try:
                    count = api.ai.get_api_call_count()
                    window.evaluate_js(f"if(window.__onApiCallUpdate) window.__onApiCallUpdate({count})")
                except: pass
                
                logger.info("ShadowLith Boot Sequence Complete.")
            except Exception as e:
                logger.error(f"Boot Routine Failure: {e}")
            
        threading.Thread(target=boot_routine, daemon=True).start()

        def hotkey_loop():
            try:
                from pynput import keyboard
                listener = keyboard.GlobalHotKeys({
                    '<alt>+z': api.toggle_ui,
                    '<ctrl>+<alt>+k': api.terminate_app
                })
                listener.start()
                logger.info("Global Hotkeys Registered.")
                while True: time.sleep(10)
            except Exception as e:
                logger.error(f"Hotkey Error: {e}")
        
        threading.Thread(target=hotkey_loop, daemon=True).start()

    window.events.shown += on_window_ready
    
    # Using 'qt' as requested by user to prevent white flash
    logger.info("Starting WebView engine (QT Backend)...")
    webview.start(gui='qt', debug=Config.DEBUG)

if __name__ == "__main__":
    try:
        start_app()
    except Exception as e:
        logger.critical(f"CRITICAL EXIT: {e}")
        logger.critical(traceback.format_exc())