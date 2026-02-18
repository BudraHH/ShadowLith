# Phase 3: The "Rubber Band" Snapper (PyQt6)

> In this phase, we build the precision eyes of ShadowLith. While a standard screenshot tool captures the whole screen, the "Rubber Band" selector allows you to draw a rectangle over exactly what you want Gemini to see—minimizing noise and maximizing accuracy.

---

## 3.1 The Overlay Strategy
To create a seamless snipping experience on Ubuntu, we launch a temporary, full-screen PyQt6 window that is nearly invisible.

### The "Dimmed" Canvas Logic
- **Freeze the Screen**: When you click "Capture," the tool takes a full-screen snapshot and displays it as a static background. This prevents the screen from moving while you are snipping.
- **The Dark Layer**: We apply a semi-transparent black overlay.
- **The "Cutout"**: As you drag your mouse, the `QRubberBand` class draws a clear rectangle, visually "cutting a hole" through the darkness to show the question clearly.

---

## 3.2 Implementation: `snapper.py`
This script handles the mouse events and the actual coordinate math. It returns the coordinates back to Phase 1's OCR engine.

```python
import sys
from PyQt6 import QtWidgets, QtCore, QtGui
import mss

class Snapper(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        # 1. Stealth Flags for Ubuntu X11
        self.setWindowFlags(
            QtCore.Qt.WindowType.FramelessWindowHint | 
            QtCore.Qt.WindowType.WindowStaysOnTopHint |
            QtCore.Qt.WindowType.X11BypassWindowManagerHint
        )
        self.setWindowState(QtCore.Qt.WindowState.WindowFullScreen)
        self.setCursor(QtCore.Qt.CursorShape.CrossCursor)
        self.setWindowOpacity(0.3) # Dim the screen
        
        self.origin = QtCore.QPoint()
        self.rubberBand = QtWidgets.QRubberBand(QtWidgets.QRubberBand.Shape.Rectangle, self)

    def mousePressEvent(self, event):
        if event.button() == QtCore.Qt.MouseButton.LeftButton:
            self.origin = event.pos()
            self.rubberBand.setGeometry(QtCore.QRect(self.origin, QtCore.QSize()))
            self.rubberBand.show()

    def mouseMoveEvent(self, event):
        if not self.origin.isNull():
            self.rubberBand.setGeometry(QtCore.QRect(self.origin, event.pos()).normalized())

    def mouseReleaseEvent(self, event):
        if event.button() == QtCore.Qt.MouseButton.LeftButton:
            rect = self.rubberBand.geometry()
            self.hide()
            self.capture_region(rect)
            QtWidgets.QApplication.quit()

    def capture_region(self, rect):
        # Convert PyQt geometry to mss-compatible dictionary
        with mss.mss() as sct:
            monitor = {
                "top": rect.y(),
                "left": rect.x(),
                "width": rect.width(),
                "height": rect.height()
            }
            sct_img = sct.grab(monitor)
            mss.tools.to_png(sct_img.rgb, sct_img.size, output="last_snip.png")
            print("Region Captured: last_snip.png")

def run_snapper():
    app = QtWidgets.QApplication(sys.argv)
    snapper = Snapper()
    snapper.show()
    app.exec()

if __name__ == "__main__":
    run_snapper()
```

---

## 3.3 Integration with Phase 2 Bridge
In your `main.py` (from Phase 2), you will now update the `capture_snip` function to call this snapper logic using a subprocess or by importing the class.

### Modified Logic in `main.py`

```python
### Modified Logic in `main.py`

```python
def capture_snip(self):
    # 1. Briefly hide the main ShadowLith window so it's not in the snip
    # (Optional: webview might not support minimize on all platforms, check docs)
    # self.window.minimize() 
    
    # 2. Run the snapper as a SUBPROCESS
    # We use subprocess to avoid GTK/Qt loop conflicts
    try:
        subprocess.run(["python3", "snapper.py"], check=True)
        
        # 3. Process the result (Phase 1)
        # 'last_snip.png' is saved by the snapper script
        self.buffer.add_snip("last_snip.png")
        return {"status": "success", "count": len(self.buffer.parts)}
        
    except Exception as e:
        print(f"Snip failed: {e}")
        return {"status": "error"}
    
    # 4. Show the UI again (Automatic if we didn't minimize, otherwise restore)
    # self.window.restore()
```

### Why Phase 3 is a "Stealth" Masterstroke
By using `QRubberBand`, you aren't just taking a picture; you are interacting with the **X11 coordinate system**. This is much more reliable than trying to "crop" a full-screen image in code. It ensures that the exact pixels you see are the exact pixels Gemini receives.

