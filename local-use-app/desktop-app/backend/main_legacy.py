
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
        self.is_visible = True
        self.audio_engine = None
        self.stop_requested = False
        self.stream_lock = threading.Lock()

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
            # Using the new Camouflage name
            hwnd = self._win_engine.get_window_handle("Microsoft Edge WebView2 Helper")
            if hwnd:
                self._win_engine.apply_stealth_mode(hwnd)
                # Start as INTERACTIVE so user can type JD/Resume
                self._win_engine.set_ghost_style(hwnd, interactive=True)
        threading.Thread(target=stealth_loop, daemon=True).start()

    def set_interactivity(self, is_interactive):
        """Toggles NOACTIVATE style so user can type or be stealthy."""
        if not self._win_engine: return False
        hwnd = self._win_engine.get_window_handle("Microsoft Edge WebView2 Helper")
        if hwnd:
            success = self._win_engine.set_ghost_style(hwnd, interactive=is_interactive)
            if success and is_interactive and self._window:
                # Force the window to top and focused so typing actually works
                # Overcomes the 'typing in underlying app' bug
                self._window.restore()
                try:
                    import win32gui
                    win32gui.SetForegroundWindow(hwnd)
                except:
                    pass
            return success
        return False

    def set_ghost_mode(self, enabled):
        """API wrapper for MainLayout.jsx toggles."""
        self.ghost_enabled = enabled
        print(f"DEBUG: Ghost Mode (Stealth) set to: {enabled}")
        return self.set_interactivity(not enabled)

    def _start_hotkey_thread(self):
        def hotkey_loop():
            try:
                from pynput import keyboard
                time.sleep(1.5) # Prevent conflict with startup handles
                listener = keyboard.GlobalHotKeys({
                    '<alt>+z': self.toggle_ui,
                    '<ctrl>+<alt>+k': self.terminate_app
                })
                listener.start()
                print("Hotkeys: Alt+Z (UI), Ctrl+Alt+K (PANIC)")
                while True: time.sleep(10) # Keep thread alive
            except Exception as e:
                print(f"Hotkey Error: {e}")
        threading.Thread(target=hotkey_loop, daemon=True).start()

    # --- UI CONTROLS ---
    def toggle_ui(self):
        if self._window:
            self.is_visible = not self.is_visible
            if self.is_visible:
                self._window.show()
                # Focus workaround
                self._window.restore() 
            else:
                self._window.hide()
            print(f"DEBUG: UI Visibility: {self.is_visible}")

    def sync_window_size(self, width, height, dpr=1.0):
        if self._window:
            # If we are in setup mode (wide), ensure we stay centered and wide
            is_setup = int(width) > 600
            clamped_width = min(1600, int(width))
            clamped_height = min(1400, int(height))
            
            # Detailed Logging for DPR Adjustment
            print(f"\n\n[UI Sync] Browser: {int(width/dpr)}x{int(height/dpr)} | DPR: {dpr} | OS Window: {clamped_width}x{clamped_height}\n\n")
            
            # Perform resize
            self._window.resize(clamped_width, clamped_height)
            
            # Force center if we transition into setup mode
            if is_setup:
                try:
                    self._window.center()
                except:
                    pass
        return "Synced"

    def set_user_context(self, resume, jd):
        if self.engine:
            self.engine.update_user_context(resume, jd)
            return True
        return False

    def chat(self, message, is_interview_mode=False, stream_id=None):
        if not self.engine: 
            return False
        
        print(f"DEBUG: Chat Stream Requested: {message} | Interview Mode: {is_interview_mode} | ID: {stream_id}")
        
        if not message.strip():
            return False
            
        self.stop_requested = False

        if is_interview_mode:
            chat_prompt = (
                f"INTERVIEWER_QUESTION: {message}\n"
                "TASK: Answer the interviewer directly. If technical changes are needed, update the logic in the Response Panel too."
            )
        else:
            chat_prompt = (
                f"USER_CHAT: {message}\n"
                "TASK: Process the user's request. Maintain the Response Panel as the source of truth if solutions are updated."
            )
        
        def chat_stream_worker():
            print(f"DEBUG: [ChatStream {stream_id}] Worker Started.")
            with self.stream_lock:
                try:
                    stream_source = self.engine.ask_stream(chat_prompt)
                    accum_text = ""
                    chunk_count = 0
                    
                    for chunk in stream_source:
                        if self.stop_requested:
                            print(f"DEBUG: [ChatStream {stream_id}] Stop Requested.")
                            break
                        
                        accum_text += chunk
                        chunk_count += 1
                        
                        if self._window:
                            safe_chunk = json.dumps(chunk)
                            safe_stream_id = json.dumps(stream_id)
                            # Reusing the existing window.__onStreamChunk
                            self._window.evaluate_js(f"window.__onStreamChunk({safe_chunk}, {safe_stream_id})")
                    
                    print(f"DEBUG: [ChatStream {stream_id}] Stream Finished. Total Chunks: {chunk_count}")
                    if self._window:
                        safe_stream_id = json.dumps(stream_id)
                        self._window.evaluate_js(f"window.__onStreamEnd({safe_stream_id})")
                        
                except Exception as e:
                    print(f"ERROR: [ChatStream {stream_id}] {e}")
                    import traceback; traceback.print_exc()
                    if self._window:
                        safe_err = json.dumps(f"STREAM_ERROR: {str(e)}")
                        safe_stream_id = json.dumps(stream_id)
                        self._window.evaluate_js(f"window.__onStreamChunk({safe_err}, {safe_stream_id})")
                        self._window.evaluate_js(f"window.__onStreamEnd({safe_stream_id})")

        threading.Thread(target=chat_stream_worker, daemon=True).start()
        return True

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

    def capture_fullscreen(self):
        """Silently captures the entire primary screen, downscales for speed, and adds to buffer."""
        if not self._window: return ""
        print("DEBUG: Jet-Speed Fullscreen Capture Requested.")
        
        try:
            from PIL import ImageGrab, Image
            # 1. Capture Screen
            screenshot = ImageGrab.grab()
            
            # 2. Downscale for speed (e.g. 1080p width max)
            width, height = screenshot.size
            if width > 1600:
                new_width = 1600
                new_height = int(height * (1600 / width))
                # Use BILINEAR for zero-latency speed
                screenshot = screenshot.resize((new_width, new_height), Image.Resampling.BILINEAR)
            
            # 3. Save to Base64 using JPEG (much faster than PNG)
            buffered = io.BytesIO()
            screenshot = screenshot.convert("RGB") # JPEG needs RGB
            screenshot.save(buffered, format="JPEG", quality=75, optimize=False)
            img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            # Store as image type
            self.snip_buffer.append({"type": "image", "data": img_base64})
            print(f"DEBUG: Fast Capture Success. Buffer Size: {len(self.snip_buffer)}")
            return {"status": "success", "count": len(self.snip_buffer)}
            
        except Exception as e:
            print(f"Fullscreen Capture Failed: {e}")
            return {"status": "failed", "count": len(self.snip_buffer)}

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
                    # For the snip tool, we STRICTLY follow user request: 
                    # Extract text via OCR immediately and discard the heavy image to kill latency.
                    if self._win_engine:
                        print("DEBUG: Extracting OCR for snippet...")
                        ocr_text = self._win_engine.run_ocr(img_path)
                        if ocr_text:
                            self.snip_buffer.append({"type": "text", "data": ocr_text})
                            print(f"DEBUG: OCR Snippet Stored. Length: {len(ocr_text)}")
                            return {"status": "success", "count": len(self.snip_buffer)}
                    
                    # Fallback to image if OCR failed or engine missing
                    with open(img_path, "rb") as f:
                        img_base64 = base64.b64encode(f.read()).decode('utf-8')
                        self.snip_buffer.append({"type": "image", "data": img_base64})
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

    def start_stream_answer(self, mode, language, scenario, transcript=None, is_audit=False, stream_id=None):
        """Starts a background thread to stream the answer to the frontend."""
        if not self.engine:
            return False
            
        self.stop_requested = False
            
        latest_snip = self.snip_buffer[-1] if self.snip_buffer else None
        
        if not latest_snip and not transcript:
            return False
        
        # ... (prompt building logic remains same)
        if is_audit:
            prompt_instructions = (
                "MODE: Progress Auditor\n"
                "INSTRUCTION: Compare the user's current progress in their IDE/Editor against the solution you previously provided. "
                "Output strictly a 'strategy' block with CONCISE bullet points titled 'AUDIT RESULTS'. "
                "1. If they are correct, just say 'On track. Keep going.' "
                "2. If they made a mistake, point out the specific line or logic error. "
                "3. If they are stuck, give a tiny 1-sentence hint for the next step. "
                "PROHIBITED: Do not rewrite the code unless strictly necessary. Keep it a nudge."
            )
        elif mode == "Assessment":
            if scenario == "Coding":
                prompt_instructions = (
                    "MODE: Assessment | SCENARIO: Coding\n"
                    "INSTRUCTION: Output strictly 3 blocks: 'problem' (concise core explanation/analysis of the logic), 'strategy' (concise rationale), and 'code' (implementation).\n"
                    "PROHIBITED: Do NOT include steps, complex performance analysis, or interview talk points."
                )
            elif scenario == "MCQ":
                prompt_instructions = (
                    "MODE: Assessment | SCENARIO: MCQ\n"
                    "INSTRUCTION: Output strictly 2 blocks: 'option' (correct answer label and content) and 'problem' (concise explanation of the problem logic).\n"
                    "CRITICAL ORDER: You MUST output 'option' block FIRST, then 'problem' block SECOND.\n"
                    "PROHIBITED: No code, no strategy, no steps, no complexity analysis."
                )
            else: # Video Recording
                prompt_instructions = (
                    "MODE: Assessment | SCENARIO: Video Recording\n"
                    "INSTRUCTION: The user needs to record a video answer. Output strictly 2 blocks: 'problem' (concise context/explanation of the task) and 'interview' (a concise, professional script or bullet points the user can read naturally while recording).\n"
                    "PROHIBITED: No code, no complex analysis, no technical strategy blocks."
                )
        else: # Interview Mode
            prompt_instructions = (
                f"MODE: {mode} | INTERVIEW TYPE: SMART (Detect Technical/Behavioral/Verbal automatically)\n"
                "INSTRUCTION: Treat this as a live verbal interview. Priority #1 is the 'interview' block (the script).\n"
                "SCRIPTING: In the 'interview' block, use **bolding** to highlight critical keywords. "
                "ORDER: Always output 'interview' and 'strategy' blocks as early as possible."
            )

        snip_text = latest_snip["data"] if (latest_snip and latest_snip["type"] == "text") else "None"
        snip_image = latest_snip["data"] if (latest_snip and latest_snip["type"] == "image") else None

        prompt = (
            f"CONTEXT:\n{prompt_instructions}\nLANGUAGE: {language}\n"
            f"VERBAL TRANSCRIPT: {transcript if transcript else 'None'}\n"
            f"SNIPPET CONTENT (OCR): {snip_text}\n"
            "TASK: Solve the technical problem in the SNIPPET CONTENT (if text is provided) or in the attached screenshot (if image is provided) using the requested block schema."
        )

        def stream_worker():
            # Force exclusivity: ensure no two streams talk to the frontend simultaneously
            print(f"DEBUG: [Stream {stream_id}] Worker Thread Started.")
            with self.stream_lock:
                print(f"DEBUG: [Stream {stream_id}] Lock Acquired. Beginning extraction...")
                accum_text_for_debug = "" 
                try:
                    # ROUTING Logic: If we have text capture, use the LIGHTER/FASTER text-only stream.
                    if snip_text != "None" or not snip_image:
                        print(f"DEBUG: [Stream {stream_id}] Path: High-Speed Text-Only")
                        stream_source = self.engine.ask_stream(prompt)
                    else:
                        print(f"DEBUG: [Stream {stream_id}] Path: Vision Multimodal")
                        stream_source = self.engine.ask_with_image_stream(prompt, snip_image)

                    chunk_count = 0
                    for chunk in stream_source:
                        if self.stop_requested:
                            print(f"DEBUG: [Stream {stream_id}] STOP REQUESTED. Terminating loop.")
                            break
                        
                        accum_text_for_debug += chunk
                        chunk_count += 1
                        if chunk_count % 10 == 0:
                            print(f"DEBUG: [Stream {stream_id}] Received chunk #{chunk_count} ({len(chunk)} bytes)")
                            
                        if self._window:
                            safe_chunk = json.dumps(chunk)
                            safe_stream_id = json.dumps(stream_id)
                            # Use JSON encoding for both chunk and stream_id to prevent JS syntax errors
                            self._window.evaluate_js(f"window.__onStreamChunk({safe_chunk}, {safe_stream_id})")
                    
                    print(f"DEBUG: [Stream {stream_id}] Stream Finished. Total Chunks: {chunk_count}")
                    if self._window:
                        safe_stream_id = json.dumps(stream_id)
                        self._window.evaluate_js(f"window.__onStreamEnd({safe_stream_id})")
                    
                    # Print full assembled response for debugging
                    print(f"DEBUG: [Stream {stream_id}] Full Assembled Response:\n{accum_text_for_debug}")
                except Exception as e:
                    print(f"DEBUG: [Stream {stream_id}] CRITICAL ERROR IN WORKER:")
                    import traceback; traceback.print_exc()
                    if self._window:
                        safe_err = json.dumps(f"STREAM_ERROR: {str(e)}")
                        safe_stream_id = json.dumps(stream_id)
                        self._window.evaluate_js(f"window.__onStreamChunk({safe_err}, {safe_stream_id})")
                        self._window.evaluate_js(f"window.__onStreamEnd({safe_stream_id})")
                finally:
                    print(f"DEBUG: [Stream {stream_id}] Worker Thread Terminated. Releasing lock.")

        threading.Thread(target=stream_worker, daemon=True).start()
        return True

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

        latest_snip = self.snip_buffer[-1] if self.snip_buffer else None
        if not latest_snip or latest_snip["type"] != "image": return "{}"
        
        response = self.engine.ask_with_image(prompt, latest_snip["data"])
        print(f"DEBUG: Vision Response Full: {response}")
        return response

    def revoke_snip(self):
        """Clears the current snippet buffer."""
        self.snip_buffer = []
        print("DEBUG: Snip Buffer Cleared.")
        return "Cleared"

    def stop_stream(self):
        self.stop_requested = True
        print("DEBUG: API: Stop Stream Flag Set.")
        return "Stopping"

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
    is_debug_env = os.getenv("SHADOWLITH_DEBUG") == "true"
    
    if not is_debug_env:
        url = os.getenv("SHADOWLITH_DEBUG_URL", "http://localhost:5174")
        print(f"DEBUG: Explicit Dev Mode Active: {url}")
    elif os.path.exists(file_path):
        url = file_path
        print("DEBUG: Production Build Loaded (file://).")
    else:
        url = "http://localhost:5174"
        print("DEBUG: Fallback to Dev Server (Build folder missing).")

    window = webview.create_window(
        "Microsoft Edge WebView2 Helper",
        url,
        width=1200,
        height=850,
        frameless=True,
        easy_drag=False,
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
        print("ShadowLith UI Loaded & CSS Injected.")

    def on_window_ready():
        # Start all background tasks after UI is shown
        threading.Thread(target=api.init_background_services, args=(window,), daemon=True).start()

    window.events.loaded += on_loaded
    window.events.shown += on_window_ready
    
    # Launch with debug=True for Dev environments to allow Inspect Element
    # Set this to False only for official releases
    is_debug_env = os.getenv("SHADOWLITH_DEBUG") == "true"
    webview.start(debug=is_debug_env, gui='qt')

if __name__ == "__main__":
    start_app()