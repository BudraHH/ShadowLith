
import os
import sys
import json
import time
import shutil
import threading
import webview
import ctypes
import base64
import io
from src.engine.gemini import ShadowLithEngine

# Lazy Initialized Engines
win_engine = None

# Fix for OpenMP conflict (Prevents silent crash during Whisper load)
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

class ShadowLithAPI:
    def __init__(self):
        self.engine = None
        self.audio_engine = None
        self._window = None
        self._win_engine = None
        self.is_ready = False
        self.ghost_enabled = False
        self.snip_buffer = [] # State management for snippets
        self._services_initialized = False

    def init_background_services(self, window):
        """Heavy lifting happens here after window is shown to prevent startup hangs."""
        if self._services_initialized: return
        self._services_initialized = True
        
        self._window = window
        print("DEBUG: Fast-Boot: Initializing Background Services...")
        
        try:
            # 1. Load Gemini Engine
            print("DEBUG: Loading Gemini Engine...")
            self.engine = ShadowLithEngine()
            
            # 2. Load WinEngine (Stealth Logic)
            print("DEBUG: Loading WinEngine...")
            from windows_engine import WindowsEngine
            self._win_engine = WindowsEngine()
            
            # 3. Start Stealth and Hotkeys in background
            print("DEBUG: Starting Stealth & Hotkey Threads...")
            self._start_stealth_thread()
            self._start_hotkey_thread()
            
            self.is_ready = True
            print("ShadowLith System Fully Operational.")
        except Exception as e:
            print(f"ERROR during Initialization: {e}")
            import traceback
            traceback.print_exc()

    def _start_stealth_thread(self):
        def stealth_loop():
            time.sleep(1) # Wait for window to register in OS
            print("Stealth Mode Enabled (WDA applied).")
            hwnd = self._win_engine.get_window_handle("ShadowLith")
            if hwnd:
                self._win_engine.apply_stealth_mode(hwnd)
        threading.Thread(target=stealth_loop, daemon=True).start()

    def _start_hotkey_thread(self):
        def hotkey_loop():
            try:
                from pynput import keyboard
                time.sleep(1.5) # Prevent conflict with startup handles
                listener = keyboard.GlobalHotKeys({
                    '<alt>+<space>': self.toggle_ui,
                    '<alt>+<shift>+<space>': self.toggle_ghost_mode
                })
                listener.start()
                print("Hotkeys Active: Alt+Space (Toggle), Alt+Shift+Space (Ghost)")
                while True: time.sleep(10) # Keep thread alive
            except Exception as e:
                print(f"Hotkey Error: {e}")
        threading.Thread(target=hotkey_loop, daemon=True).start()

    # --- UI CONTROLS ---
    def toggle_ui(self):
        if self._window:
            # Simple toggle logic
            if self._window.minimized:
                self._window.restore()
            else:
                self._window.minimize()

    def toggle_ghost_mode(self):
        """Toggle click-through mode for the OS window."""
        if not self.is_ready or not self._win_engine: return
        
        self.ghost_enabled = not self.ghost_enabled
        print(f"DEBUG: Ghost Mode Toggle: {self.ghost_enabled}")
        
        # We need the HWND
        try:
            hwnd = self._win_engine.get_window_handle("ShadowLith")
            if hwnd:
                self._win_engine.set_click_through(hwnd, self.ghost_enabled)
        except Exception as e:
            print(f"Ghost Mode Toggle Failed: {e}")

    def sync_window_size(self, width, height):
        if self._window:
            clamped_width = max(150, min(1400, int(width)))
            self._window.resize(clamped_width, 850)
        return "Synced"

    def chat(self, message, is_interview_mode=False):
        if not self.engine: 
            return json.dumps({"blocks": [{"type": "text", "content": "ShadowLith Engine still starting up... Please wait a moment."}]})
        
        print(f"DEBUG: Chat Message Received: {message} | Interview Mode: {is_interview_mode}")
        
        if not message.strip():
            return json.dumps({"blocks": [{"type": "text", "content": "Empty message."}]})
            
        if is_interview_mode:
            # Specialized prompt for answering an interviewer
            chat_prompt = (
                f"INTERVIEWER_QUESTION: {message}\n"
                "INSTRUCTION: The user is currently in a technical interview and just heard this question. "
                "Provide a direct, professional script they can say to answer it immediately. "
                "Keep it concise, natural, and confident. Avoid 'Sure, here is the answer'. Jump straight to the explanation. "
                "If code is needed, provide it in a 'code' block. Use 'text' blocks for the script. "
                "Output valid JSON."
            )
        else:
            # Standard chat interaction
            chat_prompt = (
                f"USER_CHAT: {message}\n"
                "INSTRUCTION: Reply nicely and concisely. You are chatting with the user about the previous problem. "
                "Output a single valid JSON object with a 'blocks' array. "
                "Use 'text' blocks for explanation and 'code' blocks for any code examples requested."
            )
        
        print("DEBUG: Sending Chat Query to Gemini...")
        response = self.engine.ask(chat_prompt)
        print(f"DEBUG: Chat Response: {response[:50]}...")
        return response

    def start_listening(self):
        self._ensure_audio_engine()
        if self.audio_engine:
            self.audio_engine.start_listening()
        return "Listening Started"

    def stop_listening(self):
        if self.audio_engine:
            self.audio_engine.stop_listening()
        return "Listening Stopped"

    def get_live_transcript(self):
        if not self.audio_engine: return ""
        return self.audio_engine.get_transcript(clear_after=True)

    def capture(self):
        """Captures a region of the screen using the Snip Tool (Interactive)."""
        if not self._window: return ""
        print("DEBUG: Snipping Tool Requested.")
        
        try:
            # 1. Hide the window for stealth
            self._window.hide()
            time.sleep(0.3) # Wait for fade-out to ensure it's not in the snip
            
            # 2. Launch snapper_win.py as a subprocess
            current_dir = os.path.dirname(os.path.abspath(__file__))
            snapper_path = os.path.join(current_dir, "src", "snapper_win.py")
            
            import subprocess
            # Use sys.executable to use the current virtual environment
            result = subprocess.run([sys.executable, snapper_path], capture_output=True, text=True)
            
            # 3. Restore window immediately
            self._window.show()
            
            # 4. Process result
            if "SUCCESS" in result.stdout:
                img_path = os.path.join(current_dir, "screenshots", "last_snip.png")
                if os.path.exists(img_path):
                    with open(img_path, "rb") as f:
                        data = f.read()
                        img_base64 = base64.b64encode(data).decode('utf-8')
                        self.snip_buffer.append(img_base64)
                        
                        # LOG OCR IMMEDIATELY FOR VERIFICATION
                        if self._win_engine:
                            print("DEBUG: Running Local Windows OCR for verification...")
                            ocr_text = self._win_engine.run_ocr(img_path)
                            print("--- START OCR VERIFICATION ---")
                            print(ocr_text if ocr_text else "[No text detected by local OCR]")
                            print("--- END OCR VERIFICATION ---")

                        print(f"DEBUG: Capture Success. Buffer Size: {len(self.snip_buffer)}")
                        return {"status": "success", "count": len(self.snip_buffer)}
            else:
                print(f"DEBUG: Snip Cancelled or Failed. Stdout: {result.stdout}")
            
            return {"status": "failed", "count": len(self.snip_buffer)}
            
        except Exception as e:
            print(f"Snip Tool Execution Failed: {e}")
            if self._window: self._window.show()
            return ""
            
        except Exception as e:
            print(f"Capture Failed: {e}")
            if self._window: self._window.show()
            return ""

    def _ensure_audio_engine(self):
        if not self.audio_engine:
            print("Importing & Initializing Audio Engine (Lazy Load)...")
            try:
                from src.engine.audio import AudioEngine
                self.audio_engine = AudioEngine()
            except Exception as e:
                print(f"Failed to initialize Audio Engine: {e}")

    def get_answer(self, mode, language):
        """Main entry point for processing the current snippet buffer."""
        if not self.engine: return "{}"
        if not self.snip_buffer:
            return json.dumps({"blocks": [{"type": "warning", "content": "No screenshots in buffer. Capture something first."}]})

        print(f"DEBUG: Processing {len(self.snip_buffer)} snippets in {mode} mode ({language})...")
        
        # Take the most recent snip for single-image analysis
        latest_snip = self.snip_buffer[-1]
        
        prompt = (
            f"MODE: {mode}\nLANGUAGE: {language}\n"
            "INSTRUCTION: Solve the technical problem shown in the screenshot. "
            "Follow the block schema strictly. Provide summary, complexity, problem analysis, strategy, "
            "steps, and the code solution."
        )

        return self.engine.ask_with_image(prompt, latest_snip)

    def revoke_snip(self):
        """Clears the current snippet buffer."""
        self.snip_buffer = []
        print("DEBUG: Snip Buffer Cleared.")
        return "Cleared"

    def hide_ui(self):
        if self._window:
            self._window.minimize()
        return "Hidden"

    def terminate_app(self):
        print("ShadowLith Terminating...")
        if self.audio_engine: 
            try:
                self.audio_engine.terminate()
            except:
                pass
        os._exit(0)

# --- STARTUP LOGIC ---
def start_app():
    api = ShadowLithAPI()
    
    # Determine URL
    if getattr(sys, 'frozen', False):
        BASE_DIR = sys._MEIPASS
    else:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    file_path = os.path.join(BASE_DIR, "ui", "index.html")
    
    if os.getenv("SHADOWLITH_DEBUG") == "true":
        url = os.getenv("SHADOWLITH_DEBUG_URL", "http://localhost:5174")
        print(f"Debug Mode Active: {url}")
    elif os.path.exists(file_path):
        url = file_path
        print("Production Build Loaded.")
    else:
        url = "http://localhost:5174"
        print("Fallback to Dev Server (Build missing).")

    window = webview.create_window(
        "ShadowLith",
        url,
        width=1200,
        height=850,
        frameless=True,
        transparent=True,
        on_top=True,
        js_api=api
    )

    def on_loaded():
        # Force transparency on the Root/App container
        window.evaluate_js("""
            document.body.style.backgroundColor = 'transparent';
            document.documentElement.style.backgroundColor = 'transparent';
        """)
        
        # Inject ResizeWatcher to sync OS window with React layout
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
                }
            })();
        """)
        print("ShadowLith UI Loaded & CSS Injected.")

    def on_window_ready():
        # Start all background tasks after UI is shown
        threading.Thread(target=api.init_background_services, args=(window,), daemon=True).start()

    window.events.loaded += on_loaded
    window.events.shown += on_window_ready
    
    # Launch with Qt for superior transparency support on Windows
    # We set debug=False to prevent the automatic Web Inspector popup
    webview.start(debug=False, gui='qt')

if __name__ == "__main__":
    start_app()