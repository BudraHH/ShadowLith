import json
from google import genai
from google.genai import types
from core.config import Config
from core.logger import logger

class AIService:
    """
    Handles Gemini orchestration, key rotation, and streaming.
    Decoupled from prompts and UI logic.
    """
    def __init__(self, prompt_service):
        self.prompt_service = prompt_service
        self._key_index = 0
        self.client = None
        self.chat = None
        self._quota_errors = ("quota", "exhausted", "429", "limit", "overloaded", "503")
        
        if not Config.GEMINI_KEYS:
            raise RuntimeError("No Gemini API keys found in configuration.")
            
        self._rebuild_session()

    def _current_key(self):
        return Config.GEMINI_KEYS[self._key_index]

    def _rebuild_session(self, history=None):
        key = self._current_key()
        logger.info(f"Connecting to Gemini Engine [Key Index: {self._key_index}]")
        
        self.client = genai.Client(api_key=key)
        self.chat = self.client.chats.create(
            model=Config.MODEL_ID,
            config=types.GenerateContentConfig(
                system_instruction=self.prompt_service.get_system_instruction(),
                temperature=0.1,
                response_mime_type="application/json",
            ),
            history=history
        )

    def _rotate_key(self):
        """Attempts to move to the next key while preserving history."""
        history = None
        try:
            if self.chat:
                history = self.chat.get_history()
        except:
            pass

        self._key_index = (self._key_index + 1) % len(Config.GEMINI_KEYS)
        logger.warning(f"Rotating to API key {self._key_index} due to resource limits.")
        self._rebuild_session(history=history)

    def _is_recoverable(self, error):
        msg = str(error).lower()
        return any(m in msg for m in self._quota_errors)

    def ask_stream(self, message, image_base64=None):
        """Generic streaming generator for both text and multimodal queries."""
        attempts = 0
        max_attempts = len(Config.GEMINI_KEYS)

        while attempts < max_attempts:
            try:
                if image_base64:
                    image_part = types.Part.from_bytes(
                        data=image_base64 if isinstance(image_base64, bytes) else None, # Placeholder for bytes conversion
                        mime_type="image/jpeg",
                    )
                    # If it's a string (B64), decode it
                    if isinstance(image_base64, str):
                        import base64
                        image_part = types.Part.from_bytes(
                            data=base64.b64decode(image_base64),
                            mime_type="image/jpeg"
                        )

                    stream = self.chat.send_message_stream(message=[message, image_part])
                else:
                    stream = self.chat.send_message_stream(message)

                for response in stream:
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
        self._rebuild_session()
        logger.info("AI Chat session reset.")
