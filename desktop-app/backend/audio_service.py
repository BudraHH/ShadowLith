
import os
import sys
import time
import threading
import queue
import numpy as np
import warnings

# --- STABILITY FLAGS ---
# These are CRITICAL to prevent OpenMP collisions now that we are in a separate process
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

# Suppress library warnings for clean stdout
warnings.filterwarnings("ignore")

def log(msg):
    # Log to stderr so it doesn't interfere with stdout IPC
    print(f"DEBUG_SIDECAR: {msg}", file=sys.stderr)

class AudioSidecar:
    def __init__(self, model_size="tiny.en"):
        self.model_size = model_size
        self.model = None
        self.running = False
        self.audio_queue = queue.Queue()
        self.stop_event = threading.Event()
        
        log(f"Initializing Whisper ({model_size})...")
        try:
            from faster_whisper import WhisperModel
            self.model = WhisperModel(
                self.model_size, 
                device="cpu", 
                compute_type="float32", # Most stable for sidecar
                cpu_threads=1,
                num_workers=1
            )
            log("Whisper Model Ready.")
        except Exception as e:
            log(f"CRITICAL: Whisper Load Failed: {e}")
            sys.exit(1)

    def _get_loopback_mic(self):
        try:
            import soundcard as sc
            default_speaker = sc.default_speaker()
            mics = sc.all_microphones(include_loopback=True)
            for mic in mics:
                if default_speaker.name in mic.name or "Loopback" in mic.name or getattr(mic, 'isloopback', False):
                    return mic
            return sc.get_microphone(id=default_speaker.id, include_loopback=True)
        except Exception as e:
            log(f"Mic Detection Error: {e}")
            return None

    def start_listening(self):
        if self.running: return
        self.running = True
        self.stop_event.clear()
        
        # Clear queue
        while not self.audio_queue.empty():
            try: self.audio_queue.get_nowait()
            except: break

        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()

        self.process_thread = threading.Thread(target=self._process_loop, daemon=True)
        self.process_thread.start()
        log("Listening threads active.")

    def stop_listening(self):
        self.running = False
        self.stop_event.set()
        log("Listening threads stopped.")

    def _capture_loop(self):
        mic = self._get_loopback_mic()
        if not mic: 
            log("No loopback mic found.")
            return

        samplerate = 16000
        block_size = 16000 * 3 # 3 second chunks for efficiency
        
        try:
            with mic.recorder(samplerate=samplerate) as recorder:
                while not self.stop_event.is_set():
                    data = recorder.record(numframes=block_size)
                    if data.ndim > 1:
                        data = np.mean(data, axis=1)
                    
                    data = data.astype(np.float32)
                    volume = np.sqrt(np.mean(data**2))
                    
                    if volume > 0.005: # Slight noise gate
                        self.audio_queue.put(data)
        except Exception as e:
            log(f"Capture Error: {e}")

    def _process_loop(self):
        while not self.stop_event.is_set():
            try:
                try:
                    audio_data = self.audio_queue.get(timeout=1.0)
                except queue.Empty:
                    continue

                segments, info = self.model.transcribe(audio_data, beam_size=1, language="en")
                
                for segment in segments:
                    text = segment.text.strip()
                    if text:
                        # THIS GOES TO STDOUT - Our IPC channel
                        print(f"TRANSCRIPT:{text}", flush=True)
                
            except Exception as e:
                log(f"Inference Error: {e}")

def main():
    log("Audio Sidecar Starting...")
    sidecar = AudioSidecar()
    
    # Simple stdin command loop
    while True:
        try:
            line = sys.stdin.readline()
            if not line: break # Pipe closed
            
            cmd = line.strip()
            if cmd == "START":
                sidecar.start_listening()
            elif cmd == "STOP":
                sidecar.stop_listening()
            elif cmd == "QUIT":
                break
        except EOFError:
            break
        except Exception as e:
            log(f"Command Loop Error: {e}")

    log("Audio Sidecar Terminating.")

if __name__ == "__main__":
    main()
