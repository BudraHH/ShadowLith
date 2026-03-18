import os
import sys
import time
import argparse
import subprocess
import ctypes
import ctypes.wintypes

def is_pid_alive(pid):
    """Check if a process with the given PID is still running."""
    SYNCHRONIZE = 0x00100000
    process = ctypes.windll.kernel32.OpenProcess(SYNCHRONIZE, False, pid)
    if process:
        ctypes.windll.kernel32.CloseHandle(process)
        return True
    return False

def is_window_hung(hwnd):
    """Check if a specific window handle is hung (not responding)."""
    try:
        return ctypes.windll.user32.IsHungAppWindow(hwnd) != 0
    except Exception:
        return False

def find_window_by_title(title):
    """Find a window handle by its title."""
    try:
        hwnd = ctypes.windll.user32.FindWindowW(None, title)
        return hwnd if hwnd else 0
    except Exception:
        return 0

def nuke_all():
    """Nuclear cleanup: kill all ShadowLith and Qt renderer processes."""
    CREATE_NO_WINDOW = 0x08000000
    try:
        subprocess.call(['taskkill', '/F', '/IM', 'ShadowLith.exe', '/T'], 
                      creationflags=CREATE_NO_WINDOW,
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass
    try:
        subprocess.call(['taskkill', '/F', '/IM', 'QtWebEngineProcess.exe', '/T'], 
                      creationflags=CREATE_NO_WINDOW,
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pid", type=int, required=True, help="PID of the main ShadowLith process")
    parser.add_argument("--title", type=str, default="Microsoft Edge WebView2 Helper", help="Window title to monitor")
    args = parser.parse_args()

    main_pid = args.pid
    window_title = args.title

    # Let the main app settle during boot
    time.sleep(5)

    while True:
        # Check 1: Is the main process still alive?
        if not is_pid_alive(main_pid):
            nuke_all()
            sys.exit(0)

        # Check 2: Is the window hung / not responding?
        hwnd = find_window_by_title(window_title)
        if hwnd and is_window_hung(hwnd):
            # Window is hung — force kill immediately before Windows creates ghost artifacts
            try:
                # Force terminate the main process directly via kernel
                PROCESS_TERMINATE = 0x0001
                handle = ctypes.windll.kernel32.OpenProcess(PROCESS_TERMINATE, False, main_pid)
                if handle:
                    ctypes.windll.kernel32.TerminateProcess(handle, 1)
                    ctypes.windll.kernel32.CloseHandle(handle)
            except Exception:
                pass
            # Small delay then sweep up any remaining renderer processes
            time.sleep(0.5)
            nuke_all()
            sys.exit(0)

        time.sleep(1.5)

if __name__ == "__main__":
    main()
