
import os
import subprocess
import time
import signal
import sys
import shutil

class StealthBridge:
    def __init__(self, display_num=":99", resolution="1920x1080x24"):
        self.display_num = display_num
        self.resolution = resolution
        self.processes = []
        self.xvfb_proc = None
        self.vnc_proc = None
        self.viewer_proc = None
        
        # Determine the user's browser
        self.browser_cmd = self._find_browser()

    def _find_browser(self):
        """Auto-detect available browser (Chrome/Firefox)."""
        browsers = ["google-chrome", "firefox", "chromium-browser"]
        for b in browsers:
            path = shutil.which(b)
            if path:
                return path
        return None

    def start_virtual_display(self):
        """Launches Xvfb on the target display."""
        print(f"Starting Xvfb on {self.display_num}...")
        try:
            # Check if display lock exists and clear it (dangerous but effective)
            lock_file = f"/tmp/.X{self.display_num.replace(':', '')}-lock"
            if os.path.exists(lock_file):
                os.remove(lock_file)

            self.xvfb_proc = subprocess.Popen(
                ["Xvfb", self.display_num, "-screen", "0", self.resolution],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            self.processes.append(self.xvfb_proc)
            time.sleep(2) # Wait for X server to start properly
            return True
        except Exception as e:
            print(f"Failed to start Xvfb: {e}")
            return False

    def start_vnc_server(self):
        """Launches x11vnc on the virtual display."""
        if not self.xvfb_proc: return False
        
        print("Starting x11vnc server...")
        try:
            self.vnc_proc = subprocess.Popen(
                ["x11vnc", "-display", self.display_num, "-nopw", "-forever", "-quiet", "-bg"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            self.processes.append(self.vnc_proc)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Failed to start x11vnc: {e}")
            return False

    def start_mirror_viewer(self):
        """Launches a VNC viewer on the MAIN DISPLAY (:0)."""
        print("Starting Mirror Viewer (xtightvncviewer)...")
        # Ensure we are targeting the physical display for the viewer
        env = os.environ.copy()
        env["DISPLAY"] = ":0"
        
        try:
            # -viewonly ensures user interacts with the browser naturally? 
            # WAIT. If it's viewonly, how does the user click the browser?
            # Creating a "Mirror" implies user interacts with the REAL browser window.
            # BUT the real browser is hidden in Xvfb! 
            # SO the user MUST interact with the VNC Viewer!
            # Therefore, NOT viewonly.
            
            self.viewer_proc = subprocess.Popen(
                ["xtightvncviewer", "-encodings", "tight", "-quality", "9", "localhost:0"],
                env=env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            self.processes.append(self.viewer_proc)
            return True
        except Exception as e:
            print(f"Failed to start VNC Viewer: {e}")
            return False

    def start_browser(self):
        """Launches the browser inside the Virtual Display."""
        if not self.browser_cmd:
            print("No browser found!")
            return False
            
        print(f"Launching Browser ({self.browser_cmd}) inside Stealth Layer...")
        env = os.environ.copy()
        env["DISPLAY"] = self.display_num
        
        # Chrome needs --no-sandbox sometimes in Xvfb, but usually fine.
        args = [self.browser_cmd, "--start-maximized", "https://google.com"]
        
        try:
            p = subprocess.Popen(args, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            self.processes.append(p)
            return True
        except Exception as e:
            print(f"Failed to start browser: {e}")
            return False

    def cleanup(self):
        """Kills all subprocesses."""
        print("Cleaning up Stealth Layer...")
        for p in self.processes:
            try:
                if p.poll() is None:
                    p.terminate()
                    p.wait(timeout=2)
            except:
                p.kill()
        
        # Force kill Xvfb just in case
        try:
            subprocess.run(["pkill", "-f", f"Xvfb {self.display_num}"], check=False)
        except:
            pass

    def run(self):
        """Orchestrates the startup."""
        if not shutil.which("Xvfb"):
            print("ERROR: Xvfb not found. Run setup_stealth.sh first.")
            return False

        if self.start_virtual_display():
            if self.start_vnc_server():
                if self.start_mirror_viewer():
                     pass # Browser starts after viewer so user sees it load?
                self.start_browser()
                return True
        return False

# Global instance for easy access
bridge = StealthBridge()
