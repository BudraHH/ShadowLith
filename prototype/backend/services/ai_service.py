import json
from google import genai
from google.genai import types
from core.config import Config
from core.logger import logger
import threading
import time
import base64

class AIService:
    """
    Handles Gemini orchestration, key rotation, and streaming.
    Decoupled from prompts and UI logic.
    """
    def __init__(self, prompt_service):
        self.prompt_service = prompt_service
        self._key_index = 0
        self._model_index = 0 # Tiered Model Index
        self.client = None
        self.chat = None
        self._quota_errors = ("quota", "exhausted", "429", "limit", "overloaded", "503")
        
        # API Call Tracking (Sliding Window / Rolling 60s)
        self._api_call_timestamps = []
        self._api_lock = threading.Lock()
        self._on_call_tracked = None # Callback to notify UI
        
        if not Config.GEMINI_KEYS:
            raise RuntimeError("No Gemini API keys found in configuration.")
            
        self._rebuild_session()
        self._start_sliding_monitor()

    def set_on_call_tracked(self, callback):
        self._on_call_tracked = callback

    def _start_sliding_monitor(self):
        """Background thread to drain the sliding window as requests expire (60s)."""
        def monitor():
            while True:
                try:
                    now = time.time()
                    with self._api_lock:
                        old_count = len(self._api_call_timestamps)
                        # Remove timestamps older than 60s
                        self._api_call_timestamps = [t for t in self._api_call_timestamps if now - t < 60]
                        new_count = len(self._api_call_timestamps)
                    
                    # Notify UI outside the lock if count changed
                    if new_count != old_count and self._on_call_tracked:
                        self._on_call_tracked(new_count)
                except Exception as e:
                    logger.debug(f"Monitor heartbeat skipped: {e}")
                
                time.sleep(1) # Precision check
        threading.Thread(target=monitor, daemon=True).start()

    def _track_call(self):
        """Track an API call with its precise timestamp for sliding evaluation."""
        now = time.time()
        with self._api_lock:
            # Clean current window before adding
            self._api_call_timestamps = [t for t in self._api_call_timestamps if now - t < 60]
            self._api_call_timestamps.append(now)
            count = len(self._api_call_timestamps)
            
        if self._on_call_tracked:
            self._on_call_tracked(count)

    def get_api_call_count(self):
        """Returns the number of calls currently sitting in the sliding window."""
        now = time.time()
        with self._api_lock:
            self._api_call_timestamps = [t for t in self._api_call_timestamps if now - t < 60]
            return len(self._api_call_timestamps)

    def _current_key(self):
        return Config.GEMINI_KEYS[self._key_index]

    def _current_model(self):
        return Config.GEMINI_MODELS[self._model_index]

    def _rebuild_session(self, history=None):
        key = self._current_key()
        model = self._current_model()
        logger.info(f"Connecting to Gemini Engine [{model}] [Key Index: {self._key_index}]")
        
        self.client = genai.Client(api_key=key)
        self.chat = self.client.chats.create(
            model=model,
            config=types.GenerateContentConfig(
                system_instruction=self.prompt_service.get_system_instruction(),
                temperature=0.1,
                response_mime_type="application/json",
            ),
            history=history
        )

    def _rotate_key(self):
        """Attempts to move to the next key or migrate to the next model tier while preserving history."""
        history = None
        try:
            if self.chat:
                history = self.chat.get_history()
        except:
            pass

        self._key_index += 1
        
        # If we have exhausted all keys for the current model tier...
        if self._key_index >= len(Config.GEMINI_KEYS):
            self._key_index = 0
            # Step up to the next model tier (waterfall)
            self._model_index = (self._model_index + 1) % len(Config.GEMINI_MODELS)
            logger.warning(f"MIGRATION: Exhausted keys for current tier. Moving to Model Tier {self._model_index}: {self._current_model()}")
        else:
            logger.warning(f"ROTATION: Switching to API key {self._key_index} for current model {self._current_model()}")
            
        self._rebuild_session(history=history)

    def _is_recoverable(self, error):
        msg = str(error).lower()
        return any(m in msg for m in self._quota_errors)

    def ask_stream(self, message, images=None):
        """Streaming generator for text and multimodal queries with tiered fallback."""
        attempts = 0
        total_slots = len(Config.GEMINI_KEYS) * len(Config.GEMINI_MODELS)
        max_attempts = min(total_slots, 15) # Cap at 15 retries to avoid infinite hangs

        while attempts < max_attempts:
            try:
                # Dispatch tracking only when the request is actually finalized and sent
                self._track_call()
                
                content_parts = [message]
                
                # Handle multiple images if provided as a list
                if images:
                    if not isinstance(images, list):
                        images = [images]
                    
                    for img in images:
                        if isinstance(img, str):
                            # Strip data prefix if present
                            if "," in img:
                                img = img.split(",")[1]
                            img_data = base64.b64decode(img)
                        else:
                            img_data = img # Assume raw bytes
                        
                        content_parts.append(types.Part.from_bytes(
                            data=img_data,
                            mime_type="image/jpeg"
                        ))

                # Stream the content
                for response in self.chat.send_message_stream(content_parts):
                    if response.text:
                        yield response.text
                return # Success

            except Exception as e:
                attempts += 1
                if self._is_recoverable(e) and attempts < max_attempts:
                    self._rotate_key()
                    continue
                
                logger.error(f"AI Stream Failure: {str(e)}")
                yield json.dumps({
                    "error": True, 
                    "message": f"AI Engine Error: {str(e)}",
                    "status": "ENGINE_FAIL"
                })
                return

    def reset_session(self):
        self._model_index = 0 # Back to Tier 1 on manual reset
        self._key_index = 0
        self._rebuild_session()
        logger.info("AI Chat session reset to Tier 1.")
