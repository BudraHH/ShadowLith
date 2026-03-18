import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import base64
import json

# Load environment variables
# Ensure we look for .env in the project root (2 levels up from this file)
current_dir = os.path.dirname(os.path.abspath(__file__)) # src/engine
src_dir = os.path.dirname(current_dir) # src
backend_dir = os.path.dirname(src_dir) # backend
env_path = os.path.join(backend_dir, ".env")

print(f"DEBUG: Looking for .env at: {env_path}")
print(f"DEBUG: File exists? {os.path.exists(env_path)}")

load_dotenv(env_path)

# ---------------------------------------------------------------------------
# API Key Pool – loads GEMINI_API_KEY_1 … GEMINI_API_KEY_3
# ---------------------------------------------------------------------------
API_KEYS: list[str] = []
for i in range(1, 11):
    k = os.getenv(f"GEMINI_API_KEY_{i}")
    if k:
        API_KEYS.append(k)
        print(f"DEBUG: GEMINI_API_KEY_{i} loaded ({k[:8]}...)")

if not API_KEYS:
    raise RuntimeError("No Gemini API keys found in .env (expected GEMINI_API_KEY_1 ... 10)")

print(f"DEBUG: Total API keys loaded: {len(API_KEYS)}")

# Error sub-strings that trigger an automatic key rotation
_QUOTA_ERROR_MARKERS = (
    "quota",
    "resource has been exhausted",
    "resource_exhausted",
    "429",
    "too many requests",
    "rate limit",
    "overloaded",
    "503",
    "service unavailable",
)


def _is_quota_or_overload_error(error: Exception) -> bool:
    """Return True if the exception looks like a quota / traffic issue."""
    msg = str(error).lower()
    return any(marker in msg for marker in _QUOTA_ERROR_MARKERS)


class ShadowLithEngine:
    """
    ShadowLith Core Intelligence Engine.
    Handles persistent Gemini chat sessions with structured JSON output.
    Automatically rotates through multiple API keys on quota / traffic errors.
    """

    def __init__(self):
        self._key_index: int = 0  # start with the first key
        self.model_id = "gemini-3-flash-preview"
        self.user_resume = "Not Provided"
        self.user_jd = "Not Provided"

        self._update_system_instruction()
        
        # Build client + chat for the first key
        self._build_client_and_chat()

    def _update_system_instruction(self):
        self.system_instruction = (
            "ROLE: You are ShadowLith, an elite technical analysis engine. \n\n"
            "CONTEXT:\n"
            f"RESUME: {self.user_resume}\n"
            f"JOB DESCRIPTION: {self.user_jd}\n\n"
            "CORE RULES:\n"
            "1. JSON ONLY: You MUST output ONLY valid JSON. NEVER include markdown (```) or conversational filler.\n"
            "2. DUAL-DESTINATION ROUTING:\n"
            "   - 'text' blocks are for YOUR VOICE. They are sent to the Chat Panel to talk to the user.\n"
            "   - All other blocks ('code', 'strategy', 'problem', 'analysis', 'interview', 'step', 'option') are technical assets for the Response Panel.\n"
            "3. CONTINUITY: When asked to update a solution (e.g., 'fix this', 'change that'), you MUST provide a conversational 'text' block AND the FULL updated technical set in the same JSON. This keeps the Response Panel as the absolute source of truth.\n"
            "4. SCHEMA:\n"
            "   {\n"
            "     'blocks': [\n"
            "        {'type': 'text'|'code'|'strategy'|'problem'|'analysis'|'interview'|'step'|'option', 'content': string, 'lang': string|null, 'label': string|null, 'time': string|null, 'space': string|null}\n"
            "     ],\n"
            "     'summary': string,\n"
            "     'time_complexity': string|null,\n"
            "     'space_complexity': string|null\n"
            "   }\n\n"
            "TONE: Use simple, natural, human English. Strictly avoid AI jargon (e.g., 'delve', 'leverage', 'tapestry').\n"
            "PRIORITY: Technical accuracy first. Human clarity second."
        )

    def update_user_context(self, resume, jd):
        """Updates the internal persona context and refreshes the system instruction."""
        print("DEBUG: Updating User Context (Resume & JD)...")
        self.user_resume = resume if resume else "Not Provided"
        self.user_jd = jd if jd else "Not Provided"
        self._update_system_instruction()
        self.reset() # Refresh chat with new instructions

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _current_key(self) -> str:
        return API_KEYS[self._key_index]

    def _build_client_and_chat(self, history=None):
        """(Re)create the GenAI client and chat session using the current key, preserving history."""
        key = self._current_key()
        print(f"[ShadowLith] Using API key index {self._key_index} ({key[:8]}...)")
        self.client = genai.Client(api_key=key)
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                temperature=0.1,
                response_mime_type="application/json",
            ),
            history=history
        )

    def _rotate_key(self) -> bool:
        """
        Move to the next API key while preserving the conversation history.
        """
        # Capture current history before we lose the session
        current_history = None
        try:
            if hasattr(self, 'chat') and self.chat:
                # The SDK uses get_history() to retrieve the message list
                current_history = self.chat.get_history()
        except Exception as e:
            print(f"[ShadowLith] ⚠️ Could not capture history for migration: {e}")

        prev = self._key_index
        self._key_index = (self._key_index + 1) % len(API_KEYS)
        rotated = self._key_index != prev
        
        if rotated:
            print(f"[ShadowLith] ⚡ Rotating to API key index {self._key_index}")
            try:
                self._build_client_and_chat(history=current_history)
            except Exception as e:
                print(f"[ShadowLith] ❌ Failed to build chat after rotation: {e}")
                # Fallback to fresh chat if history migration fails
                self._build_client_and_chat(history=None)
        return rotated

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def reset(self):
        """Reset the chat session to clear history (keeps current key)."""
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                temperature=0.1,
                response_mime_type="application/json",
            ),
        )

    def ask(self, buffer_text: str) -> str:
        """
        Sends text to the persistent chat session and returns the JSON response.
        Automatically retries with the next API key on quota / traffic errors.
        """
        start_index = self._key_index
        attempts = 0

        while True:
            try:
                response = self.chat.send_message(buffer_text)
                return response.text
            except Exception as e:
                attempts += 1
                if _is_quota_or_overload_error(e) and attempts < len(API_KEYS):
                    print(f"[ShadowLith] ⚠️  Key {self._key_index} hit quota/traffic error: {e}")
                    self._rotate_key()
                    # After rotation _build_client_and_chat already created a fresh
                    # chat, so we can retry immediately with the same buffer_text.
                    continue
                # Either it's a non-quota error, or we've exhausted all keys
                error_msg = str(e)
                print(f"[ShadowLith] ❌ All keys exhausted or non-recoverable error: {error_msg}")
                
                # We return a standard block structure so the Chat UI can display it as a message
                friendly_err = "Sorry to say this!\n⚠️ **API RESOURCE EXHAUSTED**: All keys in the pool have reached their limits. Please wait a few seconds or rotate your keys in .env." if _is_quota_or_overload_error(e) else f"❌ **API Error**: {error_msg}"
                return json.dumps({
                    "blocks": [
                        {"type": "text", "content": friendly_err}
                    ]
                })

    def ask_stream(self, buffer_text: str):
        """
        Streamed text query. Yields text chunks.
        """
        attempts = 0
        while True:
            try:
                for response in self.chat.send_message_stream(buffer_text):
                    yield response.text
                return
            except Exception as e:
                attempts += 1
                error_msg = str(e)
                print(f"[ShadowLith] ⚠️ Stream Error (Attempt {attempts}/{len(API_KEYS)}): {error_msg}")
                
                if _is_quota_or_overload_error(e) and attempts < len(API_KEYS):
                    print(f"[ShadowLith] ⚡ Recoverable error detected. Rotating key...")
                    self._rotate_key()
                    continue
                
                # Non-recoverable or exhausted all keys
                yield f"STREAM_ERROR: {error_msg}"
                return

    def ask_with_image(self, prompt: str, image_base64: str) -> str:
        """
        Multimodal query with automatic key-rotation on quota / traffic errors.
        """
        start_index = self._key_index
        attempts = 0

        while True:
            try:
                image_part = types.Part.from_bytes(
                    data=base64.b64decode(image_base64),
                    mime_type="image/png",
                )

                response = self.client.models.generate_content(
                    model=self.model_id,
                    contents=[prompt, image_part],
                    config=types.GenerateContentConfig(
                        system_instruction=self.system_instruction,
                        temperature=0.1,
                        response_mime_type="application/json",
                    ),
                )
                return response.text
            except Exception as e:
                attempts += 1
                if _is_quota_or_overload_error(e) and attempts < len(API_KEYS):
                    print(f"[ShadowLith] ⚠️  Key {self._key_index} hit quota/traffic error (vision): {e}")
                    self._rotate_key()
                    continue
                error_msg = str(e)
                print(f"[ShadowLith] ❌ Vision error (all keys exhausted or non-recoverable): {error_msg}")
                friendly_err = "⚠️ **VISION API EXHAUSTED**: All keys in the pool have reached their limits for image analysis." if _is_quota_or_overload_error(e) else f"❌ **Vision API Error**: {error_msg}"
                return json.dumps({
                    "blocks": [
                        {"type": "text", "content": friendly_err}
                    ]
                })

    def ask_with_image_stream(self, prompt: str, image_base64: str):
        """
        Streamed multimodal query using the persistent chat session.
        Yields text chunks.
        """
        attempts = 0
        while True:
            try:
                # Prepare parts
                image_part = types.Part.from_bytes(
                    data=base64.b64decode(image_base64),
                    mime_type="image/png",
                )
                
                # Use the persistent chat session to maintain history
                for response in self.chat.send_message_stream(
                    message=[prompt, image_part]
                ):
                    yield response.text
                return
            except Exception as e:
                attempts += 1
                if _is_quota_or_overload_error(e) and attempts < len(API_KEYS):
                    self._rotate_key()
                    # Re-trying on a fresh chat session if rotated
                    continue
                yield f"STREAM_ERROR: {str(e)}"
                return
