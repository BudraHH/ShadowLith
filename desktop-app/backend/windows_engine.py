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

    def set_window_affinity(self, hwnd: int) -> bool:
        """
        Sets the window display affinity to WDA_EXCLUDEFROMCAPTURE (0x11).
        This hides the window from screen capture.
        """
        if not self.is_windows:
            return False
            
        try:
            # We use ctypes for SetWindowDisplayAffinity as it's not always exposed in pywin32
            user32 = ctypes.windll.user32
            result = user32.SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)
            if result != 0:
                print("Stealth Mode Enabled (WDA_EXCLUDEFROMCAPTURE applied).")
                return True
            else:
                err = ctypes.get_last_error()
                print(f"Failed to set Stealth Mode. Error Code: {err}")
                return False
        except Exception as e:
            print(f"Failed to set window affinity: {e}")
            return False

    def set_click_through(self, hwnd: int, enable: bool) -> bool:
        """
        Sets the window to be click-through (transparent to input) using pywin32.
        """
        if not self.is_windows:
            return False
        
        try:
            # Use pywin32 for window style manipulation
            current_style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
            
            if enable:
                # Add Transparent and Layered flags
                new_style = current_style | win32con.WS_EX_TRANSPARENT | win32con.WS_EX_LAYERED
                print("GHOST MODE: ON (Click-Through)")
            else:
                # Remove Transparent flag
                new_style = current_style & ~win32con.WS_EX_TRANSPARENT
                # Ensure Layered is kept (often needed for alpha transparency)
                new_style |= win32con.WS_EX_LAYERED
                print("GHOST MODE: OFF (Interactive)")
            
            win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, new_style)
            
            # Force repaint optional, but usually good practice
            win32gui.SetLayeredWindowAttributes(hwnd, 0, 255, win32con.LWA_ALPHA)
            
            return True
        except Exception as e:
            print(f"Failed to set click-through (pywin32): {e}")
            return False

    async def run_ocr_async(self, image_path: str) -> str:
        """
        Runs OCR on the provided image file using Windows Media OCR.
        """
        if not self.is_windows or not self.ocr_engine:
            return "OCR Engine not available."

        try:
            from winsdk.windows.storage import StorageFile, FileAccessMode
            from winsdk.windows.graphics.imaging import BitmapDecoder
            
            # Ensure absolute path
            abs_path = os.path.abspath(image_path)
            
            # Get file
            file = await StorageFile.get_file_from_path_async(abs_path)
            stream = await file.open_async(FileAccessMode.READ)
            
            # Decode
            decoder = await BitmapDecoder.create_async(stream)
            software_bitmap = await decoder.get_software_bitmap_async()
            
            # Recognize
            result = await self.ocr_engine.recognize_async(software_bitmap)
            
            if not result or not result.lines:
                return "No text detected."
            
            text = "\n".join([line.text for line in result.lines])
            return text
            
        except Exception as e:
            print(f"OCR Execution Error: {e}")
            return f"Error: {e}"

    def run_ocr(self, image_path: str) -> str:
        """
        Synchronous wrapper for run_ocr_async.
        """
        try:
            return asyncio.run(self.run_ocr_async(image_path))
        except Exception as e:
            print(f"Sync OCR Error: {e}")
            return ""
