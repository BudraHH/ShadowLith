# Phase 6: Windows 11 Migration
> **Completed Phase**

> In this phase, we port the core ShadowLith backend to operate natively on Windows 11. This ensures that the tool is not limited to Linux (Ubuntu) environments and can be used on the most popular desktop OS. The migration focuses on maintaining the "Stealth" and "Ghost Mode" capabilities using Windows APIs.

---

## 6.1 Native Windows Engine (`windows_engine.py`)
To replace the X11-specific logic, we build a new engine that interfaces directly with the Win32 API and Windows Runtime.

### Key Components:
1.  **Stealth Mode (`SetWindowDisplayAffinity`):**
    - Uses `ctypes` to call `user32.SetWindowDisplayAffinity` with the `WDA_EXCLUDEFROMCAPTURE` (0x11) flag.
    - This hides the window from all screen capture tools (OBS, Zoom, Discord, etc.) while keeping it visible to the user.

2.  **Native OCR (`Windows.Media.Ocr`):**
    - Replaces `pytesseract` with the built-in Windows 10/11 OCR engine (`winsdk.windows.media.ocr`).
    - **Benefit:** Cleaner setup (no external binaries needed), faster execution, and GPU acceleration.

3.  **Ghost Mode (Click-Through):**
    - Uses `pywin32` (`win32gui`) to manipulate window styles (`GWL_EXSTYLE`).
    - Toggles `WS_EX_TRANSPARENT` and `WS_EX_LAYERED` to allow mouse clicks to pass through the overlay to the window behind it.

---

## 6.2 Windows Snapper (`snapper_win.py`)
The Linux capture tool relied on `mss` and `x11` specifics. The Windows version uses a more robust approach for the OS.

### Implementation:
- **Library:** `Pillow` (`ImageGrab`) for full-screen capture.
- **DPI Awareness:** Uses `SetProcessDpiAwareness` to ensure the screenshot matches the physical pixel density of the screen, preventing "blurry" or "zoomed-in" captures on high-res displays.
- **Overlay:** A `PyQt6` frameless window that displays the frozen screenshot and allows for "Rubber Band" selection.

---

## 6.3 OS-Agnostic Entry Point (`main.py`)
The `main.py` is updated to detect the running OS at startup.

### Logic Flow:
1.  **Check OS:** `if sys.platform == "win32":`
2.  **Windows:**
    - Load `WindowsEngine`.
    - Use `WebView2` (`edgechromium`) renderer.
    - Use `snapper_win.py`.
3.  **Linux:**
    - Load `TextBuffer` (Tesseract).
    - Use `GTK` / `Qt` renderer.
    - Use `snapper.py` (mss).

### Installation Helper
A standard `requirements.txt` is now used with PEP 508 environment markers to handle OS-specific dependencies:
- Installs `winsdk`, `pywin32` only on Windows.
- Installs `mss`, `pytesseract` only on Linux.

Users simply run: `pip install -r requirements.txt`
