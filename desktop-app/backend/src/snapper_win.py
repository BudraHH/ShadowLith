import sys
import ctypes
import os
from PIL import ImageGrab
from PyQt6 import QtWidgets, QtCore, QtGui

# Enable DPI Awareness logic for sharp screenshots on Windows
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1) # PROCESS_SYSTEM_DPI_AWARE
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

class SnapperWin(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        
        # 1. Capture Virtual Desktop using Pillow
        # all_screens=True captures all monitors as one large image
        try:
            # Grab all screens
            self.screenshot = ImageGrab.grab(all_screens=True)
            
            # Ensure we have a valid image
            if self.screenshot is None:
                raise ValueError("ImageGrab returned None")
                
        except Exception as e:
            # Handle error gracefully
            print(f"Failed to grab screen: {e}")
            sys.exit(1)

        # Convert PIL Image (RGB) to QImage
        # PIL uses RGB by default for grab
        self.screenshot = self.screenshot.convert("RGBA")
        data = self.screenshot.tobytes("raw", "RGBA")
        
        # Note regarding stride/bytes per line: 
        # width * 4 bytes per pixel
        qimage = QtGui.QImage(
            data, 
            self.screenshot.width, 
            self.screenshot.height, 
            QtGui.QImage.Format.Format_RGBA8888
        )
        
        # Make a copy to decouple from PIL bytes
        self.original_pixmap = QtGui.QPixmap.fromImage(qimage)

        # 2. Window Setup
        self.setWindowFlags(
            QtCore.Qt.WindowType.FramelessWindowHint | 
            QtCore.Qt.WindowType.WindowStaysOnTopHint | 
            QtCore.Qt.WindowType.Tool 
        )
        
        # Cover all monitors
        # We rely on Qt's virtualGeometry to match Pillow's capture
        screen_geometry = QtWidgets.QApplication.primaryScreen().virtualGeometry()
        self.setGeometry(screen_geometry)
        
        self.setCursor(QtCore.Qt.CursorShape.CrossCursor)
        self.setMouseTracking(True)
        self.setFocusPolicy(QtCore.Qt.FocusPolicy.StrongFocus)
        self.raise_()
        self.activateWindow()

        # 3. Drawing State
        self.origin = QtCore.QPoint()
        self.rubberBand = QtWidgets.QRubberBand(QtWidgets.QRubberBand.Shape.Rectangle, self)
        
    def paintEvent(self, event):
        painter = QtGui.QPainter(self)
        painter.setRenderHint(QtGui.QPainter.RenderHint.Antialiasing)
        
        # Draw the full screenshot
        painter.drawPixmap(self.rect(), self.original_pixmap)
        
        # Draw dark overlay
        painter.fillRect(self.rect(), QtGui.QColor(0, 0, 0, 100))
    
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
            self.rubberBand.hide()
            
            # Save Logic
            # Note: On Windows with DPI scaling, QWidget coordinates might be logical
            # We use devicePixelRatio to map back to physical pixels of the screenshot
            
            dpr = self.devicePixelRatio()
            
            if rect.width() > 10 and rect.height() > 10:
                crop_rect = QtCore.QRect(
                    int(rect.x() * dpr),
                    int(rect.y() * dpr),
                    int(rect.width() * dpr),
                    int(rect.height() * dpr)
                )
                
                cropped = self.original_pixmap.copy(crop_rect)
                
                # Determine save path securely
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                dest = os.path.join(base_dir, "screenshots", "last_snip.png")
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                
                cropped.save(dest, "PNG")
                sys.stdout.write("SUCCESS\n")
            else:
                sys.stdout.write("CANCEL\n")
                
            self.shutdown()

    def keyPressEvent(self, event):
        if event.key() == QtCore.Qt.Key.Key_Escape:
            sys.stdout.write("CANCEL\n")
            self.shutdown()
            
    def shutdown(self):
        self.close()
        QtWidgets.QApplication.quit()

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    snapper = SnapperWin()
    snapper.show()
    sys.exit(app.exec())
