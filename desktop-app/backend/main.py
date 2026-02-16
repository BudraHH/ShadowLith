import os
import sys
import webview
import subprocess
import time
from pynput import keyboard
from screeninfo import get_monitors
from src.engine.gemini import NyxEngine

# Platform specific imports & Engine Setup
if sys.platform == "win32":
    import ctypes
    from windows_engine import WindowsEngine
    try:
        # Initialize Windows Engine (OCR & Stealth)
        win_engine = WindowsEngine()
        print("Windows Engine Initialized.")
    except Exception as e:
        print(f"Windows Engine Init Failed: {e}")
        win_engine = None
else:
    # Linux/Mac Imports
    import shutil
    from src.engine.ocr import TextBuffer

# Absolute Pathing
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOT_DIR = os.path.join(BASE_DIR, "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
SNIP_PATH = os.path.join(SCREENSHOT_DIR, "last_snip.png")

# Global visibility state
is_visible = True

class ShadowLithAPI:
    def __init__(self):
        self.engine = ShadowLithEngine()
        self._window = None
        
        # OCR Backend Initialization
        if sys.platform == "win32":
            self.buffer_text = []
        else:
            tess_path = shutil.which("tesseract") or "/usr/bin/tesseract"
            self.buffer = TextBuffer(tess_path)

    def set_window(self, window):
        self._window = window

    def capture(self):
        try:
            if self._window: self._window.hide()
            
            # Clean up old snip
            if os.path.exists(SNIP_PATH):
                os.remove(SNIP_PATH)

            # Select Snapper Script based on OS
            if sys.platform == "win32":
                snapper_script = os.path.join(BASE_DIR, "src", "snapper_win.py")
            else:
                snapper_script = os.path.join(BASE_DIR, "src", "snapper.py")
            
            # Use appropriate python runner
            venv_python = os.path.join(BASE_DIR, "venv", "bin", "python")
            if sys.platform == "win32":
                venv_python = os.path.join(BASE_DIR, "venv", "Scripts", "python.exe")
            
            runner = venv_python if os.path.exists(venv_python) else sys.executable

            print(f"Launching Snapper via: {runner} -> {snapper_script}")
            
            try:
                subprocess.run([runner, snapper_script], check=True, capture_output=True, text=True)
            except subprocess.CalledProcessError as e:
                print(f"Snapper Error: {e.stderr}")
                if self._window: self._window.show()
                return {"status": "error", "message": "Snip selection cancelled or failed."}

            # Brief wait for IO
            time.sleep(0.1)

            if os.path.exists(SNIP_PATH):
                if sys.platform == "win32":
                    # Windows Native OCR (WinOCR)
                    if win_engine:
                        text = win_engine.run_ocr(SNIP_PATH)
                        if text:
                            self.buffer_text.append(text)
                            if self._window: self._window.show()
                            return {"status": "success", "count": len(self.buffer_text)}
                        else:
                            print("WinOCR returned no text.")
                    else:
                        print("WinEngine not loaded.")
                else:
                    # Linux Tesseract
                    success = self.buffer.add(SNIP_PATH)
                    if self._window: self._window.show()
                    if success:
                        return {"status": "success", "count": len(self.buffer.parts)}
            
            if self._window: self._window.show()
            return {"status": "error", "message": "No text detected."}
        
        except Exception as e:
            print(f"Capture Exception: {e}")
            if self._window: self._window.show()
            return {"status": "error", "message": str(e)}

    def get_answer(self):
        if sys.platform == "win32":
            text = "\n\n".join(self.buffer_text)
            if not text.strip():
                 return '{"type": "error", "explanation": "Buffer empty"}'
        else:
            text = self.buffer.get_full_text()
            if not text:
                 return '{"type": "error", "explanation": "Buffer empty"}'
                 
        return self.engine.ask(text)

    def revoke_snip(self):
        if sys.platform == "win32":
            self.buffer_text = []
        else:
            self.buffer.clear()
        return "Cleared"

    def hide_ui(self):
        global is_visible
        if self._window:
            self._window.hide()
            is_visible = False
        return "Hidden"

def get_hwnd(window):
    """Retrieve HWND in a cross-platform way for Windows."""
    try:
        # 1. Native Handle (common in newer pywebview / DotNet)
        if hasattr(window, 'native') and hasattr(window.native, 'Handle'):
            # It might be an IntPtr
            return int(window.native.Handle)
        
        # 2. Window Title Search (Fallback)
        # Note: If multiple windows have same title, this could be risky, but unlikely for this app.
        if sys.platform == "win32":
            hwnd = ctypes.windll.user32.FindWindowW(None, "ShadowLith")
            if hwnd: return hwnd
            
    except Exception as e:
        print(f"HWND Retrieval failed: {e}")
    return 0

def apply_stealth_hints(window):
    """Applies OS-specific stealth/window-manager hints."""
    time.sleep(0.5)
    
    if sys.platform == "win32":
        if win_engine:
            hwnd = get_hwnd(window)
            if hwnd:
                win_engine.set_window_affinity(hwnd)
            else:
                print("Could not find HWND for Stealth Mode.")
    else:
        # Existing Linux X11 Logic
        try:
             if hasattr(window.gui, 'window'):
                 win_id = window.gui.window.winId()
                 atoms = [
                     ["xprop", "-id", str(win_id), "-f", "_NET_WM_STATE", "32a", "-set", "_NET_WM_STATE", "_NET_WM_STATE_SKIP_TASKBAR"],
                     ["xprop", "-id", str(win_id), "-f", "_NET_WM_WINDOW_TYPE", "32a", "-set", "_NET_WM_WINDOW_TYPE", "_NET_WM_WINDOW_TYPE_DESKTOP"],
                     ["xprop", "-id", str(win_id), "-f", "_NET_WM_STATE", "32a", "-append", "_NET_WM_STATE", "_NET_WM_STATE_STAYS_ON_TOP"]
                 ]
                 for cmd in atoms:
                     subprocess.run(cmd, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                 print(f"ShadowLith Stealth Active | X11 ID: {win_id}")
        except Exception as e:
            print(f"Stealth injection failed: {e}")

def start_app():
    global is_visible
    w, h = 1200, 850
    api = ShadowLithAPI()
    
    # URL Logic
    file_path = os.path.join(BASE_DIR, "ui", "index.html")
    if os.getenv("SHADOWLITH_DEBUG"):
        url = os.getenv("SHADOWLITH_DEBUG_URL", "http://localhost:5174")
        print(f"Debug Mode: {url}")
    elif os.path.exists(file_path):
        url = file_path
        print("Production Build Loaded.")
    else:
        url = "http://localhost:5174"
        print("Dev Server (Localhost).")

    gui_engine = 'edgechromium' if sys.platform == 'win32' else 'qt'

    window = webview.create_window(
        title="ShadowLith",
        url=url,
        js_api=api,
        width=w, height=h,
        min_size=(800, 600),
        frameless=True,
        on_top=True,
        transparent=True,
        easy_drag=False,
        focus=False,
        background_color='#000000'
    )
    
    api.set_window(window)

    def toggle():
        global is_visible
        if window:
            if is_visible:
                window.hide()
                is_visible = False
            else:
                window.show()
                is_visible = True

    h_key = keyboard.GlobalHotKeys({'<alt>+<space>': toggle})
    h_key.start()
    
    # Ghost Mode Logic (Click-Through)
    is_ghost = False
    def toggle_ghost():
        nonlocal is_ghost
        is_ghost = not is_ghost
        
        if sys.platform == 'win32':
             if win_engine:
                 hwnd = get_hwnd(window)
                 win_engine.set_click_through(hwnd, is_ghost)
        else:
             # Linux Logic
             if hasattr(window, 'gui') and hasattr(window.gui, 'window'):
                try:
                    from PyQt6.QtCore import Qt
                    flags = window.gui.window.windowFlags()
                    if is_ghost:
                        flags |= Qt.WindowType.WindowTransparentForInput
                        flags |= Qt.WindowType.WindowStaysOnTopHint
                    else:
                        flags &= ~Qt.WindowType.WindowTransparentForInput
                        flags |= Qt.WindowType.WindowStaysOnTopHint
                    window.gui.window.setWindowFlags(flags)
                    window.gui.window.show()
                    print(f"Ghost Mode: {is_ghost}")
                except Exception as e:
                    print(f"Ghost Toggle Error: {e}")

    g_key = keyboard.GlobalHotKeys({'<alt>+<shift>+<space>': toggle_ghost})
    g_key.start()

    webview.start(apply_stealth_hints, window, gui=gui_engine)

if __name__ == "__main__":
    start_app()