
import sys
import os
import ctypes
from PyQt6 import QtWidgets, QtCore, QtGui

# Enable high-DPI scaling for sharp screenshots
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    pass

class SnapperWin(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        print("DEBUG: SnapperWin Initializing...")
        
        # 1. Capture Virtual Desktop using Native Qt (more reliable than Pillow)
        screen = QtWidgets.QApplication.primaryScreen()
        self.original_pixmap = screen.grabWindow(0)
        
        # 2. Window Setup
        self.setWindowFlags(
            QtCore.Qt.WindowType.FramelessWindowHint | 
            QtCore.Qt.WindowType.WindowStaysOnTopHint | 
            QtCore.Qt.WindowType.Tool 
        )
        
        # Match the virtual desktop geometry
        self.geom = screen.virtualGeometry()
        self.setGeometry(self.geom)
        
        # Stealth: Hide from screen capture itself
        if sys.platform == "win32":
            try:
                hwnd = int(self.winId())
                ctypes.windll.user32.SetWindowDisplayAffinity(hwnd, 0x00000011)
            except: pass

        self.setCursor(QtCore.Qt.CursorShape.ArrowCursor)
        self.setMouseTracking(True)
        
        # Drawing State
        self.origin = QtCore.QPoint()
        self.current_pos = QtCore.QPoint()
        self.is_selecting = False

    def paintEvent(self, event):
        painter = QtGui.QPainter(self)
        # 1. Draw the full screenshot as background
        painter.drawPixmap(self.rect(), self.original_pixmap)
        
        overlay_color = QtGui.QColor(0, 0, 0, 60) # Subtle 60 alpha
        
        if self.is_selecting:
            selection_rect = QtCore.QRect(self.origin, self.current_pos).normalized()
            
            # 2. Create a "Spotlight" effect by punching a hole in the overlay
            path = QtGui.QPainterPath()
            path.addRect(QtCore.QRectF(self.rect())) # Outer boundary
            path.addRect(QtCore.QRectF(selection_rect)) # Inner hole
            
            # Using OddEvenFill makes the intersection (the selection box) transparent
            path.setFillRule(QtCore.Qt.FillRule.OddEvenFill)
            painter.fillPath(path, overlay_color)
            
            # 3. Draw the subtle semi-transparent border (Tailwind emerald-700)
            painter.setPen(QtGui.QPen(QtGui.QColor(4, 120, 87, 100), 1)) 
            painter.drawRect(selection_rect)
        else:
            # Before selection starts, just dim the whole screen
            painter.fillRect(self.rect(), overlay_color)

    def mousePressEvent(self, event):
        if event.button() == QtCore.Qt.MouseButton.LeftButton:
            self.origin = event.pos()
            self.current_pos = event.pos()
            self.is_selecting = True
            self.update()

    def mouseMoveEvent(self, event):
        if self.is_selecting:
            self.current_pos = event.pos()
            self.update()

    def mouseReleaseEvent(self, event):
        if event.button() == QtCore.Qt.MouseButton.LeftButton and self.is_selecting:
            rect = QtCore.QRect(self.origin, event.pos()).normalized()
            self.is_selecting = False
            
            if rect.width() > 10 and rect.height() > 10:
                # Correct for high DPI scaling
                dpr = self.devicePixelRatio()
                crop_rect = QtCore.QRect(
                    int(rect.x() * dpr),
                    int(rect.y() * dpr),
                    int(rect.width() * dpr),
                    int(rect.height() * dpr)
                )
                
                cropped = self.original_pixmap.copy(crop_rect)
                
                # Save to specific path
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                dest = os.path.join(base_dir, "screenshots", "last_snip.png")
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                
                cropped.save(dest, "PNG")
                print("SUCCESS")
            else:
                print("CANCEL")
            
            self.close()
            QtWidgets.QApplication.quit()

    def keyPressEvent(self, event):
        if event.key() == QtCore.Qt.Key.Key_Escape:
            print("CANCEL")
            self.close()
            QtWidgets.QApplication.quit()

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    # Ensure window is visible immediately
    window = SnapperWin()
    window.showFullScreen()
    sys.exit(app.exec())
