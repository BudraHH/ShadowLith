import sys
import mss
import mss.tools
from PyQt6 import QtWidgets, QtCore, QtGui

class Snapper(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()

        # 1. Capture virtual desktop screenshot
        with mss.mss() as sct:
            sct_img = sct.grab(sct.monitors[0]) # Montior 0 is the primary monitor / all in one monitor

            # convert MSS raw bytes to QImage
            img = QtGui.QImage(sct_img.raw, sct_img.width, sct_img.height, QtGui.QImage.Format.Format_RGB32)
            self.original_pixmap = QtGui.QPixmap.fromImage(img)

        # 2. Window setup for fullscreen overlay
        self.setWindowFlags(
            QtCore.Qt.WindowType.FramelessWindowHint | 
            QtCore.Qt.WindowType.WindowStaysOnTopHint | 
            QtCore.Qt.WindowType.Tool | 
            QtCore.Qt.WindowType.X11BypassWindowManagerHint
        )

        # cover all the monitors ( matching the virtual desktop size exactly )
        screen_geometry = QtWidgets.QApplication.primaryScreen().virtualGeometry()
        self.setGeometry(screen_geometry)

        self.setCursor(QtCore.Qt.CursorShape.CrossCursor)
        self.setMouseTracking(True)

        # 3. Foucs and Input
        self.setFocusPolicy(QtCore.Qt.FocusPolicy.StrongFocus)
        self.raise_()
        self.activateWindow() # Ensure we catch the first ESC press

        # 4. Drawing State
        self.origin = QtCore.QPoint()
        self.rubberBand = QtWidgets.QRubberBand(QtWidgets.QRubberBand.Shape.Rectangle, self)

    def paintEvent(self, event):
        """Draws the frozen screenshot + a dark overlay."""
        painter = QtGui.QPainter(self)
        painter.setRenderHint(QtGui.QPainter.RenderHint.Antialiasing)

        # Draw clean screenshot
        painter.drawPixmap(self.rect(), self.original_pixmap)

        # Draw dark overlay
        painter.fillRect(self.rect(), QtGui.QColor(0, 0, 0, 100))
        
    def mousePressEvent(self, event):
        """Records the starting point of the selection."""
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
            
            # 5. Crop & Save
            #Calculate Device Pixel Ration (DPR)
            dpr = self.devicePixelRatio()

            # Provide minimum size to avaoid accidental clicks
            if rect.width() > 10 and rect.height() > 10:
                # Scale logical rect to physical pixels
                crop_rect =  QtCore.QRect(
                    int(rect.x() * dpr),
                    int(rect.y() * dpr),
                    int(rect.width() * dpr),
                    int(rect.height() * dpr)
                )

                # Copy from original high-res pixmap
                cropped = self.original_pixmap.copy(crop_rect)
                cropped.save("./screenshots/last_snip.png", "PNG")
                sys.stdout.write("SUCCESS\n") # Signal to parent process
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
    snapper = Snapper()
    snapper.show()
    sys.exit(app.exec())

                
                