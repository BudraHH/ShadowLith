# Phase 2: The "Ghost" Bridge (pywebview)

> In this phase, we build the invisible bridge. While React handles the visuals, `pywebview` serves as the system-level container that keeps your window hidden from recorders and allows the frontend to trigger Python-based intelligence.

---

## 2.1 Stealth Interaction & Hotkey Strategy
To achieve the **"Ghost"** effect on Ubuntu (X11), we use a "Click-Through" strategy triggered by a global hotkey. The window remains visible but allows mouse clicks to pass through to the underlying website until you explicitly activate it.

### Key Technical Logic
- **Global Hotkey (`Alt + Space`)**: controlled by `pynput`.
  - **Press 1 (Activate):** Makes ShadowLith "solid" and interactive.
  - **Press 2 (Dismiss):** Makes ShadowLith "click-through" (Ghost Mode) so you can interact with the assessment.
- **`focus=False`**: Critical! Prevents the window from stealing focus when clicked, avoiding "Tab Out" events.
- **Click-Through Implementation**: We use `subprocess` to call `xprop` or `xshape` commands to toggle the window's input shape mask.

### Required Dependencies
- `pynput`: For global keyboard listening.
- `python-xlib` (optional but recommended): For low-level X11 window manips.

---

import webview
import subprocess
from pynput import keyboard
from engine import NyxEngine, TextBuffer

# Global State
is_interactive = False 

class NyxAPI:
    def __init__(self):
        self.engine = NyxEngine()
        self.buffer = TextBuffer()

    def capture_snip(self):
        # 1. Launch Snapper (Subprocess)
        try:
            subprocess.run(["python3", "snapper.py"], check=True)
            self.buffer.add_snip("last_snip.png")
            return {"status": "success", "count": len(self.buffer.parts)}
        except:
            return {"status": "error"}

    def get_answer(self):
        text = self.buffer.get_full_text()
        if not text: return "Buffer empty."
        
        answer = self.engine.ask(text)
        
        # AUTO-HIDE: After answering, go back to Ghost Mode
        toggle_click_through(force_ghost=True)
        return answer

    def revoke_snip(self):
        """Clears the buffer without sending."""
        self.buffer.clear()
        return "Buffer Cleared"

    def abort_action(self):
        """Clears buffer AND hides UI immediately."""
        self.buffer.clear()
        toggle_click_through(force_ghost=True)
        return "Aborted"

    def reset_session(self):
        """Wipes Gemini memory."""
        self.engine = NyxEngine() 
        self.buffer.clear()
        return "Session Hard Reset"

def toggle_click_through(force_ghost=False):
    global is_interactive
    if force_ghost:
        is_interactive = False
    else:
        is_interactive = not is_interactive
        
    # Logic to call xprop/xshape to set input mask goes here
    # If is_interactive=False -> Window ignores mouse events
    # If is_interactive=True  -> Window accepts mouse events
    pass

def on_hotkey():
    toggle_click_through()

def start_app():
    api = NyxAPI()
    
    # Start Hotkey Listener
    listener = keyboard.GlobalHotKeys({'<alt>+<space>': on_hotkey})
    listener.start()

    window = webview.create_window(
        title='ShadowLith Control',
        url='http://localhost:5173',
        js_api=api,
        frameless=True,
        on_top=True,
        transparent=True,
        focus=False 
    )
    webview.start(gui='gtk')

if __name__ == '__main__':
    start_app()
```

---

## 2.3 The React Connection
In your React app (Phase 4), you will call these Python functions using the `window.pywebview.api` object.

### Frontend Implementation Logic
```javascript
const handleAnswer = async () => {
  // Python function is called as a Promise
  const response = await window.pywebview.api.get_answer();
  setAnswerData(response); // Update the Display Panel
};
```

---

## 2.4 X11 Atom Injection (Advanced Stealth)
To ensure the window is hidden from the Ubuntu Taskbar and Google Meet, we can inject X11 Atoms after the window is created. This tells the window manager to treat ShadowLith as a "Dock" or "Utility" window.

### The "Hidden" Script (`stealth.sh`)
```bash
# Finds the ShadowLith window and hides it from the taskbar
WID=$(xdotool search --name "ShadowLith Control")
xprop -id $WID -f _NET_WM_STATE 32a -set _NET_WM_STATE _NET_WM_STATE_SKIP_TASKBAR
xprop -id $WID -f _NET_WM_WINDOW_TYPE 32a -set _NET_WM_WINDOW_TYPE _NET_WM_WINDOW_TYPE_DOCK
```

### Why Phase 2 is Vital
By the end of this phase, you will have a floating window that you can click without losing focus on your browser. You have successfully bypassed the two most common assessment traps: **Tab Detection** and **Screen Recording**.