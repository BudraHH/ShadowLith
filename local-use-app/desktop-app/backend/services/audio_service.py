import threading
from core.logger import logger

class AudioService:
    """
    Service layer wrapper for the Audio Intelligence Engine.
    """
    def __init__(self):
        self._engine = None
        self._is_initialized = False
        self._init_lock = threading.Lock()
        self._on_transcript_callback = None

    def set_on_transcript(self, callback):
        """Sets the callback for real-time transcript push."""
        self._on_transcript_callback = callback
        if self._engine:
            self._engine.on_transcript = callback

    def _ensure_engine(self):
        with self._init_lock:
            if not self._is_initialized:
                try:
                    from src.engine.audio import AudioEngine
                    self._engine = AudioEngine(port=6123, on_transcript=self._on_transcript_callback) 
                    self._is_initialized = True
                    logger.info("Audio Engine Ready (Real-time Push Enabled).")
                except Exception as e:
                    logger.error(f"Failed to load Audio Engine: {e}")

    def start_listening(self):
        self._ensure_engine()
        if self._engine:
            threading.Thread(target=self._engine.start_listening, daemon=True).start()

    def stop_listening(self):
        if self._engine:
            threading.Thread(target=self._engine.stop_listening, daemon=True).start()

    def get_transcript(self, clear=True):
        if not self._engine: return ""
        return self._engine.get_transcript(clear_after=clear)

    def terminate(self):
        if self._engine:
            try: self._engine.terminate()
            except: pass
