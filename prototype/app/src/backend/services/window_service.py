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
WDA_NONE = 0x00000000
WDA_EXCLUDEFROMCAPTURE = 0x00000011

class WindowService:
    def __init__(self):
        self.is_windows = sys.platform == 'win32'
        if not self.is_windows:
            logger.warning("OS is not Windows. WindowService will be disabled.")

    def get_hwnd(self, title=None):
        """Finds the HWND of the application window, prioritizing PID-based matching."""
        if not self.is_windows or not win32gui: return 0
        
        # 1. Try PID-based matching (Robust even with generic titles)
        try:
            import win32process
            target_pid = os.getpid()
            found_hwnds = []

            def enum_callback(hwnd, _):
                if win32gui.IsWindowVisible(hwnd):
                    _, pid = win32process.GetWindowThreadProcessId(hwnd)
                    if pid == target_pid:
                        found_hwnds.append(hwnd)
                return True

            win32gui.EnumWindows(enum_callback, None)
            
            if found_hwnds:
                # If multiple windows found for this PID, filter by title if provided
                target_title = title or Config.APP_NAME
                for hwnd in found_hwnds:
                    if target_title in win32gui.GetWindowText(hwnd):
                        return hwnd
                # Fallback to first visible window of this process if title match fails
                return found_hwnds[0]
        except Exception as e:
            logger.debug(f"PID-based HWND lookup failed: {e}")

        # 2. Legacy Fallback: Title-only matching
        return win32gui.FindWindow(None, title or Config.APP_NAME)

    def apply_stealth(self, hwnd=None, enabled=None):
        """Hides/Shows window from screen capture (WDA) including all child renderers."""
        if not self.is_windows: return False
        _hwnd = hwnd or self.get_hwnd()
        if not _hwnd: return False
        
        # Use provided value or fallback to global config
        is_on = enabled if enabled is not None else Config.STEALTH_MODE_ON
        affinity = WDA_EXCLUDEFROMCAPTURE if is_on else WDA_NONE
        
        try:
            # 1. Apply to main parent window
            ctypes.windll.user32.SetWindowDisplayAffinity(_hwnd, affinity)
            
            # 2. Recursively apply to all child render windows (QtWebEngine/Chromium)
            def enum_child_proc(child_hwnd, _):
                try:
                    ctypes.windll.user32.SetWindowDisplayAffinity(child_hwnd, affinity)
                except Exception:
                    pass
                return True
                
            EnumChildProcType = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
            ctypes.windll.user32.EnumChildWindows(_hwnd, EnumChildProcType(enum_child_proc), 0)
            
            logger.info(f"Stealth Mode (WDA) {'ENABLED' if is_on else 'DISABLED'} for HWND: {_hwnd} and children")
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
            if not win32gui: return False # Added check
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
            
            # Recursive application to children (sometimes QT creates separate taskbar-eligible children)
            def enum_child_style(child_hwnd, _):
                try:
                    c_style = win32gui.GetWindowLong(child_hwnd, win32con.GWL_EXSTYLE)
                    c_style |= WS_EX_TOOLWINDOW
                    c_style &= ~WS_EX_APPWINDOW
                    win32gui.SetWindowLong(child_hwnd, win32con.GWL_EXSTYLE, c_style)
                except: pass
                return True
            
            try:
                if win32gui:
                    win32gui.EnumChildWindows(_hwnd, enum_child_style, None)
            except: pass

            # Force refresh
            win32gui.SetWindowPos(_hwnd, 0, 0, 0, 0, 0, 
                win32con.SWP_NOMOVE | win32con.SWP_NOSIZE | win32con.SWP_NOZORDER | win32con.SWP_FRAMECHANGED)
            
            logger.info(f"Window Style: Interactive={interactive} (Taskbar Hidden)")
            return True
        except Exception as e:
            logger.error(f"Failed to apply window style: {e}")
            return False

    def is_visible(self, hwnd=None):
        if not self.is_windows or not win32gui: return False
        _hwnd = hwnd or self.get_hwnd()
        if _hwnd:
            return win32gui.IsWindowVisible(_hwnd) != 0
        return False

    def force_focus(self, hwnd=None):
        if not self.is_windows or not win32gui: return
        _hwnd = hwnd or self.get_hwnd()
        if _hwnd:
            try:
                win32gui.SetForegroundWindow(_hwnd)
            except:
                pass

    def hide(self, hwnd=None):
        """Thread-safe hide bypass for background processes."""
        if not self.is_windows or not win32gui: return
        _hwnd = hwnd or self.get_hwnd()
        if _hwnd:
            win32gui.ShowWindow(_hwnd, win32con.SW_HIDE)

    def show(self, hwnd=None):
        """Thread-safe show bypass for background processes."""
        if not self.is_windows or not win32gui: return
        _hwnd = hwnd or self.get_hwnd()
        if _hwnd:
            win32gui.ShowWindow(_hwnd, win32con.SW_SHOW)
            win32gui.SetWindowPos(_hwnd, win32con.HWND_TOPMOST, 0, 0, 0, 0, 
                win32con.SWP_NOMOVE | win32con.SWP_NOSIZE | win32con.SWP_SHOWWINDOW)
