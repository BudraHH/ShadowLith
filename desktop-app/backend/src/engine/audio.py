
import subprocess
import threading
import os
import sys
import time

class AudioEngine:
    """
    ShadowLith Audio Intelligence Engine - Sidecar Manager.
    Instead of running in-process, this manages a standalone subprocess 
    to avoid OpenMP/Qt binary collisions.
    """
    def __init__(self):
        self.process = None
        self.transcript_buffer = []
        self.is_running = False
        self._lock = threading.Lock()
        
        # Determine paths
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.backend_dir = os.path.abspath(os.path.join(self.current_dir, "..", ".."))
        self.service_path = os.path.join(self.backend_dir, "audio_service.py")
        
        self._start_sidecar()

    def _start_sidecar(self):
        """Launches the isolated audio service."""
        try:
            print(f"DEBUG: Launching Audio Sidecar at {self.service_path}")
            
            # Use the same python interpreter as the main app
            self.process = subprocess.Popen(
                [sys.executable, self.service_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1 # Line buffered for real-time reads
            )
            
            # Start stdout reader thread
            threading.Thread(target=self._stdout_reader, daemon=True).start()
            # Start stderr reader thread (for debug logs)
            threading.Thread(target=self._stderr_reader, daemon=True).start()
            
            print("DEBUG: Audio Sidecar Process Started.")
        except Exception as e:
            print(f"CRITICAL: Failed to start Audio Sidecar: {e}")

    def start_listening(self):
        """Sends START command to sidecar."""
        if not self.process: return False
        try:
            self.process.stdin.write("START\n")
            self.process.stdin.flush()
            self.is_running = True
            print("DEBUG: Sent START to Sidecar.")
            return True
        except Exception as e:
            print(f"Error sending to sidecar: {e}")
            return False

    def stop_listening(self):
        """Sends STOP command to sidecar."""
        if not self.process: return False
        try:
            self.process.stdin.write("STOP\n")
            self.process.stdin.flush()
            self.is_running = False
            print("DEBUG: Sent STOP to Sidecar.")
            return True
        except Exception as e:
            print(f"Error sending to sidecar: {e}")
            return False

    def get_transcript(self, clear_after=False):
        """Retrieves and optionally clears the collected transcript strings."""
        with self._lock:
            text = " ".join(self.transcript_buffer)
            if clear_after:
                self.transcript_buffer = []
            return text

    def _stdout_reader(self):
        """Background thread reading from the sidecar's stdout."""
        while self.process and self.process.stdout:
            line = self.process.stdout.readline()
            if not line: break
            
            line = line.strip()
            if line.startswith("TRANSCRIPT:"):
                text = line.replace("TRANSCRIPT:", "", 1).strip()
                if text:
                    print(f"🗣️ Sidecar Heard: {text}")
                    with self._lock:
                        self.transcript_buffer.append(text)

    def _stderr_reader(self):
        """Pass-through for sidecar debug logs to the main console."""
        while self.process and self.process.stderr:
            line = self.process.stderr.readline()
            if not line: break
            print(f"[Sidecar] {line.strip()}")

    def terminate(self):
        """Gracefully shut down the sidecar."""
        if self.process:
            try:
                self.process.stdin.write("QUIT\n")
                self.process.stdin.flush()
                time.sleep(0.5)
                self.process.terminate()
            except:
                pass
            finally:
                self.process = None

def __del__(self):
    self.terminate()
