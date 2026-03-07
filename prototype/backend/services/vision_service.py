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
        """Async OCR using the pre-warmed Windows Media OCR engine."""
        if not self._is_ready or not self._ocr_engine:
            return ""

        try:
            from winsdk.windows.graphics.imaging import BitmapDecoder
            from winsdk.windows.storage.streams import DataWriter, InMemoryRandomAccessStream
            
            stream = InMemoryRandomAccessStream()
            writer = DataWriter(stream.get_output_stream_at(0))
            writer.write_bytes(image_bytes)
            await writer.store_async()
            await writer.flush_async()

            decoder = await BitmapDecoder.create_async(stream)
            bitmap = await decoder.get_software_bitmap_async()
            
            result = await self._ocr_engine.recognize_async(bitmap)
            text = result.text if result else ""
            if text:
                print(f"\n[OCR EXTRACTED] >>>\n{text}\n<<< [OCR END]\n")
            return text
        except Exception as e:
            logger.error(f"OCR Internal Error: {e}")
            return ""

    def preprocess_for_ocr(self, img):
        """Enhances image specifically for OCR accuracy."""
        img = ImageOps.grayscale(img)
        enhancer = ImageEnhance.Contrast(img)
        return enhancer.enhance(Config.OCR_CONTRAST)

    def capture_with_snip_ocr(self):
        """Interactive snip targeted at Text Extraction (OCR)."""
        import subprocess
        import sys
        
        try:
            logger.info("Launching Interactive OCR Snip...")
            result = subprocess.run([sys.executable, str(Config.SNAPPER_PATH)], capture_output=True, text=True)
            
            if "SUCCESS" in result.stdout:
                img_path = Config.SCREENSHOTS_DIR / "last_snip.png"
                if img_path.exists():
                    with Image.open(img_path) as img:
                        # Preprocess for better OCR
                        processed_img = self.preprocess_for_ocr(img)
                        buffered = io.BytesIO()
                        processed_img.save(buffered, format="PNG")
                        
                        ocr_text = asyncio.run(self.run_ocr(buffered.getvalue()))
                        if ocr_text:
                            return {"type": "text", "data": ocr_text}
            return None
        except Exception as e:
            logger.error(f"OCR snip failed: {e}")
            return None

    def capture_with_snip_visual(self):
        """Interactive snip targeted at Visual Analysis (Multimodal)."""
        import subprocess
        import sys
        
        try:
            logger.info("Launching Interactive Visual Snip...")
            result = subprocess.run([sys.executable, str(Config.SNAPPER_PATH)], capture_output=True, text=True)
            
            if "SUCCESS" in result.stdout:
                img_path = Config.SCREENSHOTS_DIR / "last_snip.png"
                if img_path.exists():
                    with Image.open(img_path) as img:
                        width, height = img.size
                        if width > 1600:
                            new_width = 1600
                            new_height = int(height * (1600 / width))
                            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                        
                        buffered = io.BytesIO()
                        img = img.convert("RGB")
                        img.save(buffered, format="JPEG", quality=Config.SCREENSHOT_QUALITY)
                        
                        return {
                            "type": "image", 
                            "data": base64.b64encode(buffered.getvalue()).decode('utf-8')
                        }
            return None
        except Exception as e:
            logger.error(f"Visual snip failed: {e}")
            return None
