# 🏗️ ShadowLith: Development Roadmap

## Phase 1: The Core Intelligence Engine (Backend)
> **Goal:** Establish the persistent "Same Chat" connection with Gemini and local OCR capability.

### 1.1 Environment Setup
- Initialize a Python virtual environment.
- Install core dependencies: `google-generativeai`, `pytesseract`, `mss`, `Pillow`.

### 1.2 Persistent Chat Logic
- Create a `GeminiEngine` class.
- Implement `model.start_chat(history=[])` as a class variable to maintain the 2-hour context.
- Write a `send_query(buffer)` method that appends a "Master Instruction" to the user's snipped text.

### 1.3 Local OCR Pipeline
- Integrate `pytesseract` to process images from the `mss` screen grabber.
- Implement the `TextBuffer` logic to append multiple snips into one string.

---

## Phase 2: The "Ghost" Bridge (pywebview)
> **Goal:** Create the "invisible" container that will host your React UI.

### 2.1 pywebview Skeleton
- Set up `main.py` to launch a `webview.create_window`.
- **Crucial Flags:** Set `frameless=True`, `on_top=True`, and `transparent=True`.
- **X11 Stealth:** Use `focus=False` in the window configuration to prevent the "Tab Out" detection on assessment sites.

### 2.2 The Python-JS API
- Create a `Bridge` class in Python to expose functions like `start_snip()`, `clear_buffer()`, and `get_answer()`.
- Test communication by calling a Python `print()` from the browser console.

---

## Phase 3: The "Rubber Band" Snapper (PyQt6)
> **Goal:** Build the precision snipping tool that captures specific screen regions.

### 3.1 Overlay Design
- Create a temporary PyQt6 window that covers the entire screen.
- Set a semi-transparent black background (`QColor(0, 0, 0, 100)`).

### 3.2 Selection Logic
- Implement `mousePressEvent`, `mouseMoveEvent`, and `mouseReleaseEvent`.
- Use `QRubberBand` to draw the selection rectangle.

### 3.3 Data Hand-off
- On release, use `QScreen.grabWindow` to capture the selected coordinates.
- Close the overlay and pass the image path back to the Phase 1 OCR engine.

---

## Phase 4: The "Control Center" & "Display" (React)
> **Goal:** Design the user interface with the Split-Pane layout.

### 4.1 Sidebar (Control Center)
- Build a vertical navigation bar with buttons for **Capture**, **Revoke**, and **Answer**.
- Style with 80% opacity so it's visible to you but fits the "stealth" aesthetic.

### 4.2 Content Area (Split-Pane)
- Implement a dynamic renderer that splits the screen when code is detected.
- Use `react-syntax-highlighter` for the **Answer Section**.
- Use a clean typography for the **Explanation Section** (Simple English).

### 4.3 State Handling
- Manage the "Loading" state (a subtle pulse) while Gemini is thinking.

---

## Phase 5: Stealth & Deployment (Ubuntu Optimization)
> **Goal:** Finalize the "Invisible to Google Meet" atoms and system integration.

### 5.1 X11 Atom Injection
- Use `subprocess` to call `xprop` on the ShadowLith window ID.
- Set `_NET_WM_STATE_SKIP_TASKBAR` and `_NET_WM_WINDOW_TYPE_DOCK`.

### 5.2 Systemd Integration
- Create `shadowlith.service` in `~/.config/systemd/user/`.
- Enable the service so ShadowLith is always ready in the background.

### 5.3 Process Masking
- Change the process name in the `.service` file to mimic a standard Ubuntu system process.

---

## Phase 6: Windows 11 Migration (Completed)
> **Goal:** Port the backend logic to Windows 11 while maintaining stealth and performance.

### 6.1 Windows Engine (`windows_engine.py`)
- Implement `SetWindowDisplayAffinity` using `ctypes` for `WDA_EXCLUDEFROMCAPTURE` stealth.
- Integrate `winsdk.windows.media.ocr` for native, offline text recognition.
- Use `pywin32` for `GWL_EXSTYLE` manipulation to enable "Ghost Mode" (Click-Through).

### 6.2 Windows Snapper (`snapper_win.py`)
- Replace `mss` with `Pillow` (`ImageGrab`) for reliable screen capture.
- Update `PyQt6` overlay to handle Windows High-DPI scaling (`SetProcessDpiAwareness`).

### 6.3 Setup & Integration
- Create `setup_windows.py` for automated dependency installation (`pywebview[edgechromium]`, `pywin32`, etc.).
- Update `main.py` to auto-detect OS and switch between Linux and Windows engines.