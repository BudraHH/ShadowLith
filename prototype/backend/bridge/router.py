import json
import threading
import time
from core.logger import logger
from core.decorators import bridge_safe, latency_timer
from core.config import Config

class ShadowLithAPI:
    def __init__(self, ai, vision, window, audio, prompt):
        self.ai = ai
        self.vision = vision
        self.window = window
        self.audio = audio
        self.prompt = prompt
        
        self._window_ref = None # PyWebView window
        self.snip_buffer = []
        self.stop_requested = False
        self.stream_lock = threading.Lock()

        # Connect API Tracking
        def push_api_count(count):
            if self._window_ref:
                self._window_ref.evaluate_js(f"if(window.__onApiCallUpdate) window.__onApiCallUpdate({count})")
        self.ai.set_on_call_tracked(push_api_count)

    def set_window(self, window):
        self._window_ref = window
        # Hook up real-time audio push
        def push_transcript(text):
            if self._window_ref:
                safe_text = json.dumps(text)
                print(f"[PUSH -> UI] {text}", flush=True) # Immediate Verification
                self._window_ref.evaluate_js(f"if(window.__onTranscript) window.__onTranscript({safe_text})")
        
        self.audio.set_on_transcript(push_transcript)

    # --- UI STATE & SYSTEM ---
    @bridge_safe
    def toggle_ui(self):
        if self._window_ref:
            visible = not self._window_ref.get_visibility()
            if visible:
                self._window_ref.show()
                self._window_ref.restore()
            else:
                self._window_ref.hide()
            logger.info(f"UI Visibility toggled: {visible}")

    @bridge_safe
    def set_ghost_mode(self, enabled):
        """Toggles 'Ghost' (NoActivate) style."""
        return self.set_interactivity(not enabled)

    @bridge_safe
    def set_interactivity(self, is_interactive):
        """Bridge compatibility for textarea focus handling."""
        success = self.window.set_ghost_style(interactive=is_interactive)
        if success and is_interactive and self._window_ref:
            self._window_ref.restore()
            self.window.force_focus()
        return success

    @bridge_safe
    def sync_window_size(self, width, height, dpr=1.0):
        if self._window_ref:
            clamped_width = min(1600, int(width))
            clamped_height = min(1400, int(height))
            self._window_ref.resize(clamped_width, clamped_height)
            if int(width) > 600:
                try:
                    self._window_ref.center()
                except:
                    pass
        return "Synced"

    @bridge_safe
    def set_user_context(self, resume, jd):
        self.prompt.update_context(resume, jd)
        self.ai.reset_session()
        return True

    # --- CAPTURE & VISION ---
    @bridge_safe
    @latency_timer
    def capture_fullscreen(self):
        logger.info("Button Clicked: Analyse Screen [Fullscreen]")
        res = self.vision.capture_fullscreen()
        if res:
            with self.stream_lock:
                self.snip_buffer.append(res)
            return {"status": "success", "count": len(self.snip_buffer)}
        return {"status": "failed", "count": len(self.snip_buffer)}

    @bridge_safe
    @latency_timer
    def capture_ocr(self):
        """Interactive OCR Snip (Non-blocking)."""
        logger.info("Button Clicked: Capture (OCR)")
        def _task():
            try:
                self.window.hide()
                time.sleep(0.5)
                res = self.vision.capture_with_snip_ocr()
                if res:
                    with self.stream_lock:
                        self.snip_buffer.append(res)
                        count = len(self.snip_buffer)
                    if self._window_ref:
                        self._window_ref.evaluate_js(f"if(window.__onCaptureUpdate) window.__onCaptureUpdate('success', {count})")
                else:
                    if self._window_ref: self._window_ref.evaluate_js(f"window.__onCaptureUpdate('failed')")
                self.window.show()
                if self._window_ref: self._window_ref.restore()
            except Exception as e:
                logger.error(f"OCR Capture error: {e}")
                self.window.show()
        threading.Thread(target=_task, daemon=True).start()
        return {"status": "started"}

    @bridge_safe
    @latency_timer
    def capture_visual(self):
        """Interactive Visual Snip (Non-blocking)."""
        logger.info("Button Clicked: Analyse Snippet [Visual]")
        def _task():
            try:
                self.window.hide()
                time.sleep(0.5)
                res = self.vision.capture_with_snip_visual()
                if res:
                    with self.stream_lock:
                        self.snip_buffer.append(res)
                        count = len(self.snip_buffer)
                    if self._window_ref:
                        self._window_ref.evaluate_js(f"if(window.__onCaptureUpdate) window.__onCaptureUpdate('success', {count})")
                else:
                    if self._window_ref: self._window_ref.evaluate_js(f"window.__onCaptureUpdate('failed')")
                self.window.show()
                if self._window_ref: self._window_ref.restore()
            except Exception as e:
                logger.error(f"Visual Capture error: {e}")
                self.window.show()
        threading.Thread(target=_task, daemon=True).start()
        return {"status": "started"}

    @bridge_safe
    def revoke_snip(self):
        logger.info("Button Clicked: Clear Snips")
        with self.stream_lock:
            self.snip_buffer = []
        logger.info("Snip buffer cleared.")
        return "Cleared"

    @bridge_safe
    def reset_chat(self):
        """Full reset of AI engine session (memory) and buffer."""
        logger.info("Button Clicked: Reset Session")
        with self.stream_lock:
            self.snip_buffer = []
        self.ai.reset_session()
        logger.info("AI Bridge and Buffer fully reset.")
        return True

    # --- AI & CHAT ---
    @bridge_safe
    def chat(self, message, is_interview_mode=False, stream_id=None):
        logger.info(f"Bridge Action: Send Chat Message [Mode: {'Intrv' if is_interview_mode else 'Chat'}]")
        if not message.strip(): return False
        
        prompt = self.prompt.build_chat_prompt(message, is_interview_mode)
        self._start_stream(prompt, stream_id=stream_id)
        return True

    @bridge_safe
    def start_stream_answer(self, mode, language, scenario, transcript=None, is_audit=False, stream_id=None):
        logger.info("Button Clicked: Process [Solve]")
        # Thread-safe snapshot of the buffer to prevent "list changed size" crash
        with self.stream_lock:
            buffer_snapshot = list(self.snip_buffer)
            self.snip_buffer = [] # Clear buffer on process start
            
        images = [snip["data"] for snip in buffer_snapshot if snip["type"] == "image"]
        texts = [snip["data"] for snip in buffer_snapshot if snip["type"] == "text"]
        
        # Combine snippets into the transcript context if they are text
        # Filter out empty strings to avoid join artifacts
        valid_texts = [t for t in texts if t and str(t).strip()]
        snippet_text = "\n".join(valid_texts)
        full_transcript = (transcript or "") + ("\n" + snippet_text if snippet_text else "")
        
        if not images and not full_transcript.strip():
            logger.warning("No context (images or text) available for analysis.")
            return False

        logger.info(f"Processing Request | Snips: {len(images)} images, {len(valid_texts)} texts")
        prompt = self.prompt.build_analysis_prompt(mode, language, scenario, full_transcript, is_audit)
        
        self._start_stream(prompt, images=images, stream_id=stream_id)
        # Notify UI that count is now 0
        if self._window_ref:
            self._window_ref.evaluate_js(f"if(window.__onCaptureUpdate) window.__onCaptureUpdate('success', 0)")
            
        return True

    def _start_stream(self, message, images=None, stream_id=None):
        self.stop_requested = False
        
        def worker():
            with self.stream_lock:
                try:
                    stream = self.ai.ask_stream(message, images)
                    for chunk in stream:
                        if self.stop_requested: break
                        if self._window_ref:
                            # Direct JS injection
                            safe_chunk = json.dumps(chunk)
                            safe_id = json.dumps(stream_id)
                            self._window_ref.evaluate_js(f"window.__onStreamChunk({safe_chunk}, {safe_id})")
                    
                    if self._window_ref:
                        self._window_ref.evaluate_js(f"window.__onStreamEnd({json.dumps(stream_id)})")
                except Exception as e:
                    logger.error(f"Worker Stream Error: {e}")

        threading.Thread(target=worker, daemon=True).start()

    @bridge_safe
    def stop_stream(self):
        logger.info("Button Clicked: Stop Analysis")
        self.stop_requested = True
        return "Stopping"

    # --- AUDIO ---
    @bridge_safe
    def start_listening(self):
        logger.info("Button Clicked: Listen Start (Mic On)")
        threading.Thread(target=self.audio.start_listening, daemon=True).start()
        return "Started"

    @bridge_safe
    def stop_listening(self):
        logger.info("Button Clicked: Listen Stop (Mic Off)")
        threading.Thread(target=self.audio.stop_listening, daemon=True).start()
        return "Stopped"

    @bridge_safe
    def get_live_transcript(self):
        text = self.audio.get_transcript(clear=True)
        if text:
            logger.info(f"Bridge sending transcript to UI: {text}")
        return text

    @bridge_safe
    def terminate_app(self):
        logger.info("Button Clicked: Quit Application")
        logger.info("Termination requested.")
        self.audio.terminate()
        import os
        os._exit(0)
