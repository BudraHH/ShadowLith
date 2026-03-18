import os
import sys

# --- ALPHA STABILITY FLAGS (Must be 1st) ---
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

import ctypes
# --- STEALTH CRASH DEFENSE (Must be early) ---
try:
    # 1. Disable WerFault crash dialogs
    SEM_FAILCRITICALERRORS = 0x0001
    SEM_NOGPFAULTERRORBOX  = 0x0002
    SEM_NOOPENFILEERRORBOX = 0x8000
    ctypes.windll.kernel32.SetErrorMode(SEM_FAILCRITICALERRORS | SEM_NOGPFAULTERRORBOX | SEM_NOOPENFILEERRORBOX)
    ctypes.windll.kernel32.SetUnhandledExceptionFilter(0)
    # 2. Disable DWM Ghost Windows ("Not Responding" replacement windows)
    # This is the critical API that prevents Windows from creating visible ghost windows
    ctypes.windll.user32.DisableProcessWindowsGhosting()
except Exception:
    pass

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
    os._exit(1) # Fail-fast aggressive termination

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
        hidden=True, # Hidden-by-Default to prevent flash
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
                
                # 2. Get native handle with retry
                _hwnd = None
                for attempt in range(10):
                    _hwnd = api.window.get_hwnd()
                    if _hwnd:
                        break
                    time.sleep(0.5)
                
                if _hwnd:
                    logger.info(f"System: Optimizing Native Window [HWND: {_hwnd}]")
                    
                    # 3. Apply stealth with RETRY + VERIFICATION loop
                    stealth_confirmed = False
                    for attempt in range(10):
                        api.window.apply_stealth(_hwnd)
                        # Verify WDA was actually applied by reading it back
                        try:
                            import ctypes
                            affinity = ctypes.c_uint(0)
                            ctypes.windll.user32.GetWindowDisplayAffinity(_hwnd, ctypes.byref(affinity))
                            if affinity.value != 0:
                                stealth_confirmed = True
                                logger.info(f"Stealth VERIFIED on attempt {attempt + 1} (Affinity: {affinity.value})")
                                break
                            else:
                                logger.warning(f"Stealth NOT applied on attempt {attempt + 1}, retrying...")
                        except Exception:
                            pass
                        time.sleep(0.5)
                    
                    api.window.set_ghost_style(interactive=True, hwnd=_hwnd)
                    
                    # 4. Only show once stealth is confirmed
                    if stealth_confirmed:
                        window.show()
                        logger.info("Window shown with verified stealth.")
                    else:
                        logger.error("STEALTH COULD NOT BE VERIFIED — showing anyway as fallback.")
                        window.show()
                    
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

    window.events.loaded += on_window_ready
    
    import subprocess
    watchdog_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "watchdog.py")
    try:
        subprocess.Popen([sys.executable, watchdog_path, "--pid", str(os.getpid()), "--title", Config.APP_NAME], 
                         creationflags=subprocess.CREATE_NO_WINDOW)
        logger.info("Watchdog started.")
    except Exception as w_e:
        logger.error(f"Failed to start watchdog: {w_e}")

    # Using 'qt' as requested by user to prevent white flash
    logger.info("Starting WebView engine (QT Backend)...")
    webview.start(gui='qt', debug=Config.DEBUG)

if __name__ == "__main__":
    # Check if we are being called as a sidecar/snapper subprocess
    if len(sys.argv) > 1 and "--snapper" in sys.argv:
        try:
            from src.snapper_win import SnapperWin
            import sys
            import ctypes
            from PyQt6.QtWidgets import QApplication
            
            try:
                ctypes.windll.shcore.SetProcessDpiAwareness(1)
            except Exception:
                pass
            
            app = QApplication(sys.argv)
            
            # Extract save path if provided
            save_path = None
            if len(sys.argv) > 2:
                save_path = sys.argv[2]
                
            snipper = SnapperWin(save_path=save_path)
            snipper.showFullScreen() # snapper_win uses showFullScreen natively
            sys.exit(app.exec())
        except Exception as e:
            print(f"FAILED_TO_START_SNAPPER: {e}")
            sys.exit(1)
            
    try:
        start_app()
    except Exception as e:
        logger.critical(f"CRITICAL EXIT: {e}")
        logger.critical(traceback.format_exc())