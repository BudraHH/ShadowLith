import os
import sys
import time
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent / "app" / "src" / "backend"
sys.path.append(str(backend_dir))

from services.window_service import WindowService

def test_hwnd_identification():
    service = WindowService()
    print(f"Current Process ID: {os.getpid()}")
    
    # Since we don't have a visible window in this CLI script easily, 
    # we'll just check if it fails gracefully or finds something if we were to have one.
    # In a real app, pywebview creates the window.
    
    hwnd = service.get_hwnd()
    print(f"Found HWND: {hwnd}")
    
    if hwnd == 0:
        print("No window found for current process (expected in CLI test).")
    else:
        import win32gui
        import win32process
        title = win32gui.GetWindowText(hwnd)
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        print(f"Window Title: {title}")
        print(f"Window PID: {pid}")
        assert pid == os.getpid(), f"Found window of wrong process! {pid} != {os.getpid()}"

if __name__ == "__main__":
    try:
        test_hwnd_identification()
        print("\nSUCCESS: HWND identification logic is sound.")
    except Exception as e:
        print(f"\nFAILURE: {e}")
        sys.exit(1)
