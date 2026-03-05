import io
import asyncio
import base64
import time
from PIL import Image, ImageOps, ImageEnhance, ImageGrab
from core.config import Config
from core.logger import logger
from core.decorators import latency_timer

class VisionService:
    def __init__(self):
        self._ocr_engine = None
        self._is_ready = False
        # Lazy load winsdk to prevent startup lag on non-windows
        self._init_ocr()

    def _init_ocr(self):
        try:
            from winsdk.windows.media.ocr import OcrEngine
            self._ocr_engine = OcrEngine.try_create_from_user_profile_languages()
            if self._ocr_engine:
                self._is_ready = True
                logger.info("Windows OCR Engine pre-warmed and ready.")
        except Exception as e:
            logger.warning(f"Windows OCR Engine unavailable: {e}")

    @latency_timer
    def capture_fullscreen(self):
        """Ultra-fast fullscreen capture to memory."""
        try:
            screenshot = ImageGrab.grab()
            
            # Optimization: Downscale if redundant
            width, height = screenshot.size
            if width > 1600:
                new_width = 1600
                new_height = int(height * (1600 / width))
                screenshot = screenshot.resize((new_width, new_height), Image.Resampling.BILINEAR)
            
            # Save to BytesIO (In-Memory)
            buffered = io.BytesIO()
            screenshot = screenshot.convert("RGB")
            screenshot.save(buffered, format="JPEG", quality=Config.SCREENSHOT_QUALITY)
            
            return {
                "type": "image",
                "data": base64.b64encode(buffered.getvalue()).decode('utf-8')
            }
        except Exception as e:
            logger.error(f"Fullscreen capture failed: {e}")
            return None

    @latency_timer
    async def run_ocr(self, image_bytes):
        """Async OCR using the pre-warmed engine."""
        if not self._is_ready or not self._ocr_engine:
            return ""

        try:
            from winsdk.windows.graphics.imaging import BitmapDecoder
            from winsdk.windows.storage.streams import DataWriter, InMemoryRandomAccessStream
            
            # Convert PIL image to bytes for WinSDK if needed
            # In this refactor, we usually pass PNG/JPEG bytes
            
            stream = InMemoryRandomAccessStream()
            writer = DataWriter(stream.get_output_stream_at(0))
            writer.write_bytes(image_bytes)
            await writer.store_async()
            await writer.flush_async()

            decoder = await BitmapDecoder.create_async(stream)
            bitmap = await decoder.get_software_bitmap_async()
            
            result = await self._ocr_engine.recognize_async(bitmap)
            return result.text if result else ""
        except Exception as e:
            logger.error(f"OCR Internal Error: {e}")
            return ""

    def preprocess_image(self, image_path_or_bytes):
        """Enhances image for OCR accuracy."""
        try:
            if isinstance(image_path_or_bytes, bytes):
                img = Image.open(io.BytesIO(image_path_or_bytes))
            else:
                img = Image.open(image_path_or_bytes)
                
            img = ImageOps.grayscale(img)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(Config.OCR_CONTRAST)
            
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            return img_byte_arr.getvalue()
        except Exception as e:
            logger.error(f"Preprocessing failed: {e}")
            return None

    def capture_with_snip(self, window_handle=None):
        """
        Interactive snip. 
        Note: For now, keeping the subprocess call for UI transition logic, 
        but centralizing result handling.
        """
        import subprocess
        import sys
        import os

        try:
            logger.info("Launching Interactive Snip Tool...")
            result = subprocess.run([sys.executable, str(Config.SNAPPER_PATH)], capture_output=True, text=True)
            
            if "SUCCESS" in result.stdout:
                img_path = Config.SCREENSHOTS_DIR / "last_snip.png"
                if img_path.exists():
                    # Process and Return
                    with open(img_path, "rb") as f:
                        processed_bytes = self.preprocess_image(f.read())
                        
                    # OCR immediately for performance as per original design
                    ocr_text = asyncio.run(self.run_ocr(processed_bytes))
                    if ocr_text:
                        return {"type": "text", "data": ocr_text}
                    
                    # Fallback to image if OCR empty
                    with open(img_path, "rb") as f:
                        return {
                            "type": "image", 
                            "data": base64.b64encode(f.read()).decode('utf-8')
                        }
            return None
        except Exception as e:
            logger.error(f"Snip Tool failed: {e}")
            return None
