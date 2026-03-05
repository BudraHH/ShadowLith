import ctypes
import sys
import os
from core.config import Config
from core.logger import logger

try:
    import win32gui
    import win32con
    import win32api
except ImportError:
    win32gui = None

# Constants
WDA_EXCLUDEFROMCAPTURE = 0x00000011

class WindowService:
    def __init__(self):
        self.is_windows = sys.platform == 'win32'
        if not self.is_windows:
            logger.warning("OS is not Windows. WindowService will be disabled.")

    def get_hwnd(self, title=None):
        if not self.is_windows or not win32gui: return 0
        return win32gui.FindWindow(None, title or Config.APP_NAME)

    def apply_stealth(self, hwnd=None):
        """Hides window from screen capture (WDA)."""
        if not self.is_windows: return False
        _hwnd = hwnd or self.get_hwnd()
        if not _hwnd: return False
        
        try:
            ctypes.windll.user32.SetWindowDisplayAffinity(_hwnd, WDA_EXCLUDEFROMCAPTURE)
            logger.info(f"Stealth Mode (WDA) applied to HWND: {_hwnd}")
            return True
        except Exception as e:
            logger.error(f"Failed to set window affinity: {e}")
            return False

    def set_ghost_style(self, interactive=False, hwnd=None):
        """Toggles Taskbar visibility and Click-interactivity."""
        if not self.is_windows or not win32gui: return False
        _hwnd = hwnd or self.get_hwnd()
        if not _hwnd: return False

        try:
            # GWL_EXSTYLE attributes
            WS_EX_TOOLWINDOW = 0x00000080
            WS_EX_APPWINDOW  = 0x00040000
            WS_EX_NOACTIVATE = 0x08000000

            style = win32gui.GetWindowLong(_hwnd, win32con.GWL_EXSTYLE)
            
            # Hide from Taskbar
            style |= WS_EX_TOOLWINDOW
            style &= ~WS_EX_APPWINDOW
            
            # Interactivity (Focus)
            if interactive:
                style &= ~WS_EX_NOACTIVATE
            else:
                style |= WS_EX_NOACTIVATE

            win32gui.SetWindowLong(_hwnd, win32con.GWL_EXSTYLE, style)
            
            # Force refresh
            win32gui.SetWindowPos(_hwnd, 0, 0, 0, 0, 0, 
                win32con.SWP_NOMOVE | win32con.SWP_NOSIZE | win32con.SWP_NOZORDER | win32con.SWP_FRAMECHANGED)
            
            logger.info(f"Window Style: Interactive={interactive}")
            return True
        except Exception as e:
            logger.error(f"Failed to apply window style: {e}")
            return False

    def force_focus(self, hwnd=None):
        if not self.is_windows or not win32gui: return
        _hwnd = hwnd or self.get_hwnd()
        if _hwnd:
            try:
                win32gui.SetForegroundWindow(_hwnd)
            except:
                pass
