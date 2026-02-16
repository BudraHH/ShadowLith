import sys
import os

# Set WebView2 Background to Transparent (0) BEFORE importing webview
if sys.platform == "win32":
    # Fallback to Black (FF000000 AARRGGBB) to prevent White Flash if transparency fails
    os.environ['WEBVIEW2_DEFAULT_BACKGROUND_COLOR'] = 'FF000000'

import webview
import subprocess
import time
from pynput import keyboard
from screeninfo import get_monitors
from src.engine.gemini import ShadowLithEngine

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
                            print(f"DEBUG: WinOCR Success | Length: {len(text)} chars | Text Preview: {text[:50]}...")
                            self.buffer_text.append(text)
                            if self._window: self._window.show()
                            return {"status": "success", "count": len(self.buffer_text)}
                        else:
                            print("DEBUG: WinOCR returned empty string.")
                    else:
                        print("DEBUG: WinOCR Engine not initialized.")
                else:
                    # Linux Tesseract
                    success = self.buffer.add(SNIP_PATH)
                    if self._window: self._window.show()
                    if success:
                        return {"status": "success", "count": len(self.buffer.parts)}
            
            if self._window: self._window.show()
            return {"status": "error", "message": "No text detected."}
        
        except Exception as e:
            print(f"DEBUG: Capture Exception: {e}")
            if self._window: self._window.show()
            return {"status": "error", "message": str(e)}

    def get_answer(self, mode="Assessment", language="Python"):
        print(f"DEBUG: Processing Request | Mode: {mode} | Language: {language} | Buffer Count: {len(self.buffer_text)}")
        if sys.platform == "win32":
            text = "\n\n".join(self.buffer_text)
            if not text.strip():
                 print("DEBUG: Buffer is empty, aborting request.")
                 return '{"type": "error", "explanation": "Buffer empty"}'
        else:
            text = self.buffer.get_full_text()
            if not text:
                 return '{"type": "error", "explanation": "Buffer empty"}'
                 
        # Prepend mode context if provided
        full_query = f"MODE: {mode}\nLANGUAGE: {language}\n\nCONTENT:\n{text}"
        
        print("DEBUG: Sending Query to Gemini...")
        response = self.engine.ask(full_query)
        
        print("-" * 40)
        print("DEBUG: RAW GEMINI RESPONSE:")
        print(response)
        print("-" * 40)
        
        return response

    
    def chat(self, message):
        """Send a message to the persistent chat session with condensed instruction."""
        print(f"DEBUG: Chat Message Received: {message}")
        if not message.strip():
            return '{"type": "error", "explanation": "Empty message"}'
            
        # Wrap user message to enforce JSON behavior even in chat
        chat_prompt = (
            f"USER_CHAT: {message}\n"
            "INSTRUCTION: Reply nicely and concisely. You are chatting with the user about the previous problem. "
            "Output a single valid JSON object with a 'blocks' array. "
            "Use 'text' blocks for explanation and 'code' blocks for any code examples requested."
        )
        
        print("DEBUG: Sending Chat Query to Gemini...")
        response = self.engine.ask(chat_prompt)
        print(f"DEBUG: Chat Response: {response}")
        return response

    def revoke_snip(self):
        if sys.platform == "win32":
            self.buffer_text = []
        else:
            self.buffer.clear()
        self.engine.reset()
        return "Cleared"

    def hide_ui(self):
        global is_visible
        if self._window:
            self._window.hide()
            is_visible = False
        return "Hidden"

    def resize_window(self, width, height):
        """Resize the native OS window."""
        if self._window:
            self._window.resize(width, height)
        return f"Resized to {width}x{height}"

    def sync_window_size(self, width, height):
        """Called by the frontend ResizeObserver to sync native window."""
        if self._window:
            # Enforce Hard Constraints: Min 150px (Collapsed), Max 1400px (Full)
            clamped_width = max(150, min(1400, int(width)))
            # Height is FIXED at 800px
            self._window.resize(clamped_width, 800)
        return "Synced"

    def set_ghost_mode(self, enable):
        """Toggle click-through (Ghost Mode) via the UI."""
        if sys.platform == 'win32' and win_engine:
            hwnd = get_hwnd(self._window)
            win_engine.set_click_through(hwnd, enable)
            return f"Ghost Mode: {enable}"
        return "Not Supported on this Platform"

    def terminate_app(self):
        """Cleanly exit the application."""
        if self._window:
            self._window.destroy()
        sys.exit(0)

def get_hwnd(window):
    """Retrieve HWND in a cross-platform way for Windows."""
    try:
        # 1. Qt Backend (winId)
        if hasattr(window, 'native') and hasattr(window.native, 'winId'):
             return int(window.native.winId())
             
        # 2. .NET/Edge Backend (Handle)
        if hasattr(window, 'native') and hasattr(window.native, 'Handle'):
            # It might be an IntPtr
            return int(window.native.Handle)
        
        # 3. Window Title Search (Fallback)
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
                try:
                    GWL_EXSTYLE = -20
                    WS_EX_LAYERED = 0x00080000
                    user32 = ctypes.windll.user32
                    
                    # 1. Layered Window
                    style = user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
                    user32.SetWindowLongW(hwnd, GWL_EXSTYLE, style | WS_EX_LAYERED)
                    
                    # 2. Force Background Brush to NULL (Prevent White Flash/Paint)
                    GCLP_HBRBACKGROUND = -10
                    # 0 = NULL_BRUSH (Transparent), 4 = BLACK_BRUSH
                    # Note: SetClassLongPtr might be SetClassLongW on 32-bit python, but we assume 64-bit usually
                    try:
                         if sys.maxsize > 2**32:
                             user32.SetClassLongPtrW(hwnd, GCLP_HBRBACKGROUND, 0)
                         else:
                             user32.SetClassLongW(hwnd, GCLP_HBRBACKGROUND, 0)
                    except:
                         pass # API might not exist on some older systems
                         
                except Exception as e:
                    print(f"Layered Style/Brush Injection Failed: {e}")

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
        url = os.getenv("SHADOWLITH_DEBUG_URL")
        print(f"Debug Mode: {url}")
    elif os.path.exists(file_path):
        url = file_path
        print("Production Build Loaded.")
    else:
        url = "http://localhost:5174"
        print("Forced Dev Server (Localhost) - UI Build Not Found.")

    # Use Qt engine on Windows (User Preferred for Transparency)
    gui_engine = 'qt'

    window = webview.create_window(
        title="ShadowLith",
        url=url,
        js_api=api,
        width=w, height=h,
        min_size=(150, 100),
        frameless=True,
        on_top=True,
        transparent=True,
        easy_drag=False,
        focus=True,
        background_color='#000000', # Force Black Background
        hidden=False # DEBUG: Show window immediately
    )
    
    api.set_window(window)

    def on_loaded():
        # Inject CSS to force transparency
        window.evaluate_js("""
            document.body.style.backgroundColor = 'transparent';
            document.documentElement.style.backgroundColor = 'transparent';
        """)
        
        # INJECT NATIVE RESIZE WATCHER:
        # Watches the React Layout and syncs the OS window size automatically
        # Throttled with requestAnimationFrame for smoothness
        window.evaluate_js("""
            (function() {
                let rAF_running = false;
                const observer = new ResizeObserver(entries => {
                    if (rAF_running) return;
                    rAF_running = true;
                    
                    requestAnimationFrame(() => {
                        for (let entry of entries) {
                            const width = entry.contentRect.width;
                            const height = document.body.scrollHeight;
                            if (width > 50) {
                                window.pywebview.api.sync_window_size(width, height);
                            }
                        }
                        rAF_running = false;
                    });
                });
                
                const target = document.querySelector('#root > div');
                if (target) {
                    observer.observe(target);
                    console.log("ShadowLith Smooth-ResizeWatcher Active");
                }
            })();
        """)
        
        window.show()
        print("ShadowLith UI Loaded & Visible (ResizeWatcher Active)")

    window.events.loaded += on_loaded

    def toggle():
        global is_visible
        if window:
            if is_visible:
                window.hide()
                is_visible = False
            else:
                window.show()
                is_visible = True

    def setup_hotkeys():
        try:
            h_key = keyboard.GlobalHotKeys({'<alt>+<space>': toggle})
            h_key.start()
            
            # Use a lambda for ghost toggle to capture current state
            ghost_state = [False] # Use a list for closure mutability
            def toggle_ghost_wrapper():
                ghost_state[0] = not ghost_state[0]
                if sys.platform == 'win32' and win_engine:
                    hwnd = get_hwnd(window)
                    win_engine.set_click_through(hwnd, ghost_state[0])

            g_key = keyboard.GlobalHotKeys({'<alt>+<shift>+<space>': toggle_ghost_wrapper})
            g_key.start()
            print("ShadowLith Hotkeys Active: Alt+Space (Toggle UI), Alt+Shift+Space (Ghost Mode)")
        except Exception as e:
            print(f"Hotkey Setup Failed: {e}")

    # Start hotkeys in a separate thread after a short delay to prevent startup hang
    import threading
    threading.Timer(2.0, setup_hotkeys).start()

    webview.start(apply_stealth_hints, window, gui=gui_engine)

if __name__ == "__main__":
    start_app()