import ctypes
import os
import sys
import asyncio
from typing import Optional

# Constants
WDA_NONE = 0x00000000
WDA_MONITOR = 0x00000001
WDA_EXCLUDEFROMCAPTURE = 0x00000011

class WindowsEngine:
    def __init__(self):
        self.is_windows = sys.platform == 'win32'
        self.ocr_engine = None
        
        if self.is_windows:
            try:
                # Late imports to avoid breaking on non-Windows dev environments
                from winsdk.windows.media.ocr import OcrEngine
                from winsdk.windows.globalization import Language
                
                # Import pywin32 components
                global win32gui, win32con, win32api
                import win32gui
                import win32con
                import win32api
                
                # Try to create OCR engine with user's language
                self.ocr_engine = OcrEngine.try_create_from_user_profile_languages()
                if not self.ocr_engine:
                    print("Warning: Could not create OcrEngine from user profile languages.")
            except ImportError:
                print("Warning: winsdk or pywin32 not installed. Functionality limited.")
            except Exception as e:
                print(f"Error initializing Windows Engine: {e}")

    def get_window_handle(self, title: str) -> int:
        """Finds a window handle by its title."""
        if not self.is_windows:
            return 0
        try:
            return win32gui.FindWindow(None, title)
        except Exception as e:
            print(f"Error finding window '{title}': {e}")
            return 0

    def apply_stealth_mode(self, hwnd: int) -> bool:
        """Alias for set_window_affinity for better readability in main.py"""
        return self.set_window_affinity(hwnd)

    def set_window_affinity(self, hwnd: int) -> bool:
        """ Hides the window from screen capture. """
        if not self.is_windows: return False
        try:
            user32 = ctypes.windll.user32
            result = user32.SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)
            if result != 0:
                print("Stealth Mode Enabled (WDA applied).")
                return True
            return False
        except Exception as e:
            print(f"Failed to set window affinity: {e}")
            return False

    def set_click_through(self, hwnd: int, enable: bool) -> bool:
        """ Sets the window to be click-through (transparent to input). """
        if not self.is_windows: return False
        try:
            current_style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
            if enable:
                new_style = current_style | win32con.WS_EX_TRANSPARENT | win32con.WS_EX_LAYERED
            else:
                new_style = current_style & ~win32con.WS_EX_TRANSPARENT
                new_style |= win32con.WS_EX_LAYERED
            
            win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, new_style)
            win32gui.SetLayeredWindowAttributes(hwnd, 0, 255, win32con.LWA_ALPHA)
            return True
        except Exception as e:
            print(f"Failed to set click-through: {e}")
            return False

    async def _run_ocr_internal(self, img_data):
        """Internal async OCR logic."""
        from winsdk.windows.graphics.imaging import BitmapDecoder
        from winsdk.windows.storage.streams import DataWriter, InMemoryRandomAccessStream
        
        stream = InMemoryRandomAccessStream()
        writer = DataWriter(stream.get_output_stream_at(0))
        writer.write_bytes(img_data)
        await writer.store_async()
        await writer.flush_async()

        decoder = await BitmapDecoder.create_async(stream)
        bitmap = await decoder.get_software_bitmap_async()
        
        result = await self.ocr_engine.recognize_async(bitmap)
        return result.text if result else ""

    def run_ocr(self, image_path: str) -> str:
        """Runs OCR with pre-processing (Grayscale + High Contrast)."""
        if not self.is_windows or not self.ocr_engine:
            return "OCR Engine not available."

        try:
            from PIL import Image, ImageOps, ImageEnhance
            import io

            # 1. Pre-process for character clarity
            with Image.open(image_path) as img:
                img = ImageOps.grayscale(img)
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(2.5) # Strong boost
                
                # Convert to bytes for WinSDK
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_data = img_byte_arr.getvalue()

            # 2. Execute Async OCR in Sync Wrapper
            return asyncio.run(self._run_ocr_internal(img_data))
        except Exception as e:
            print(f"OCR Error: {e}")
            return ""
