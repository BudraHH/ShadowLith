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
        res = self.vision.capture_fullscreen()
        if res:
            self.snip_buffer.append(res)
            return {"status": "success", "count": len(self.snip_buffer)}
        return {"status": "failed", "count": len(self.snip_buffer)}

    @bridge_safe
    @latency_timer
    def capture(self):
        """Interactive Snipping Tool."""
        if self._window_ref:
            self._window_ref.hide()
            time.sleep(0.3) # Current way, will optimize later to 'Ghost Camera'

        res = self.vision.capture_with_snip()
        
        if self._window_ref:
            self._window_ref.show()
            
        if res:
            self.snip_buffer.append(res)
            return {"status": "success", "count": len(self.snip_buffer)}
        return {"status": "failed", "count": len(self.snip_buffer)}

    @bridge_safe
    def revoke_snip(self):
        self.snip_buffer = []
        logger.info("Snip buffer cleared.")
        return "Cleared"

    # --- AI & CHAT ---
    @bridge_safe
    def chat(self, message, is_interview_mode=False, stream_id=None):
        if not message.strip(): return False
        
        prompt = self.prompt.build_chat_prompt(message, is_interview_mode)
        self._start_stream(prompt, stream_id=stream_id)
        return True

    @bridge_safe
    def start_stream_answer(self, mode, language, scenario, transcript=None, is_audit=False, stream_id=None):
        latest_snip = self.snip_buffer[-1] if self.snip_buffer else None
        if not latest_snip and not transcript: return False

        prompt = self.prompt.build_analysis_prompt(mode, language, scenario, transcript, is_audit)
        
        image_data = None
        if latest_snip and latest_snip["type"] == "image":
            image_data = latest_snip["data"]

        self._start_stream(prompt, image_base64=image_data, stream_id=stream_id)
        return True

    def _start_stream(self, message, image_base64=None, stream_id=None):
        self.stop_requested = False
        
        def worker():
            with self.stream_lock:
                try:
                    stream = self.ai.ask_stream(message, image_base64)
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
        self.stop_requested = True
        return "Stopping"

    # --- AUDIO ---
    @bridge_safe
    def start_listening(self):
        threading.Thread(target=self.audio.start_listening, daemon=True).start()
        return "Started"

    @bridge_safe
    def stop_listening(self):
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
        logger.info("Termination requested.")
        self.audio.terminate()
        import os
        os._exit(0)
