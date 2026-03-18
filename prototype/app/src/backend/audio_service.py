import os
import sys
import time
import threading
import queue
import socket
import json
import numpy as np
import warnings
import traceback

# --- STABILITY FLAGS ---
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

# Suppress library warnings
warnings.filterwarnings("ignore")

# Dedicated Sidecar Log File
LOG_FILE = "audio_sidecar_debug.log"

def log(msg):
    timestamp = time.strftime("%H:%M:%S")
    formatted = f"[{timestamp}] AUDIO_SIDECAR: {msg}"
    print(formatted, file=sys.stderr, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except:
        pass

class AudioSidecar:
    def __init__(self, model_size="tiny.en", port=6123):
        self.model_size = model_size
        self.port = port
        self.model = None
        self.running = False
        self.audio_queue = queue.Queue()
        self.stop_event = threading.Event()
        self.conn = None
        
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind(('127.0.0.1', self.port))
            self.server_socket.listen(1)
            log(f"Socket Server Live on {self.port}")
        except Exception as e:
            log(f"Socket Bind Failed: {e}")
            sys.exit(1)
        
        log(f"Loading Whisper {model_size}...")
        try:
            from faster_whisper import WhisperModel
            self.model = WhisperModel(
                self.model_size, 
                device="cpu", 
                compute_type="float32",
                cpu_threads=1,
                num_workers=1
            )
            log("Whisper Ready.")
        except Exception as e:
            log(f"Whisper Load Error: {e}")
            sys.exit(1)

    def _get_loopback_mic(self):
        """Robust Loopback Detection from Unrefactored Version."""
        try:
            import soundcard as sc
            import ctypes
            
            # Explicit COM Init
            ctypes.windll.ole32.CoInitialize(None)
            
            default_speaker = sc.default_speaker()
            mics = sc.all_microphones(include_loopback=True)
            log(f"System Default Speaker: {default_speaker.name}")
            
            # 1. Primary: Exact Loopback for Default Speaker
            for mic in mics:
                is_lp = getattr(mic, 'isloopback', False) or "Loopback" in mic.name or "Stereo Mix" in mic.name
                if is_lp and (default_speaker.name in mic.name or "Stereo Mix" in mic.name):
                    log(f"MATCH FOUND: Using Loopback/Mix -> {mic.name}")
                    return mic
            
            # 2. Fallback: Any Loopback device
            for mic in mics:
                if getattr(mic, 'isloopback', False) or "Loopback" in mic.name or "Stereo Mix" in mic.name:
                    log(f"FALLBACK: Using Generic Loopback -> {mic.name}")
                    return mic
            
            log("CRITICAL: No System Loopback detected. Falling back to default mic.")
            return mics[0] if mics else None
        except Exception as e:
            log(f"Mic Discovery Error: {e}")
            return None

    def start_listening(self):
        if self.running: return
        self.running = True
        self.stop_event.clear()
        
        # Threads
        self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.capture_thread.start()

        self.process_thread = threading.Thread(target=self._process_loop, daemon=True)
        self.process_thread.start()
        log("Streaming Started.")

    def stop_listening(self):
        self.running = False
        self.stop_event.set()
        log("Streaming Stopped.")

    def _capture_loop(self):
        import ctypes
        ctypes.windll.ole32.CoInitialize(None)
        
        mic = self._get_loopback_mic()
        if not mic: return

        samplerate = 16000
        # RESTORING 3-SECOND CONTEXT FOR ACCURACY (Prevents Hallucinations)
        block_size = samplerate * 3 
        
        try:
            with mic.recorder(samplerate=samplerate) as recorder:
                while not self.stop_event.is_set():
                    data = recorder.record(numframes=block_size)
                    if data.ndim > 1:
                        data = np.mean(data, axis=1)
                    
                    data = data.astype(np.float32)
                    volume = np.sqrt(np.mean(data**2))
                    
                    # RESTORING ROBUST NOISE GATE
                    if volume > 0.005: 
                        self.audio_queue.put(data)
                    else:
                        if time.time() % 5 < 0.1:
                            log(f"Idle Capture. Vol: {volume:.5f}")
        except Exception as e:
            log(f"Capture Error: {e}")

    def _process_loop(self):
        while not self.stop_event.is_set():
            try:
                try:
                    audio_data = self.audio_queue.get(timeout=1.0)
                except queue.Empty:
                    continue

                # Whisper prefers context. 3s of audio significantly reduces 'random word' hallucinations.
                segments, info = self.model.transcribe(audio_data, beam_size=1, language="en")
                
                for segment in segments:
                    text = segment.text.strip()
                    if text:
                        if self.conn:
                            try:
                                payload = json.dumps({"type": "transcript", "text": text}) + "\n"
                                self.conn.sendall(payload.encode('utf-8'))
                            except:
                                self.conn = None
                        log(f"Sidecar Heard: {text}")
                
            except Exception as e:
                log(f"Inference Error: {e}")

    def run_ipc_server(self):
        log("Waiting for main app handshake...")
        while True:
            try:
                conn, addr = self.server_socket.accept()
                log(f"Bridge Connected: {addr}")
                self.conn = conn
                
                # Handshake
                self.conn.sendall(json.dumps({"type": "status", "msg": "READY"}).encode('utf-8') + b"\n")
                
                while True:
                    data = self.conn.recv(1024).decode('utf-8')
                    if not data: break
                    
                    cmd = data.strip()
                    if cmd == "START":
                        self.start_listening()
                    elif cmd == "STOP":
                        self.stop_listening()
                    elif cmd == "QUIT":
                        return
            except Exception as e:
                log(f"IPC Error: {e}")
                time.sleep(1)

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 6123
    sidecar = AudioSidecar(port=port)
    sidecar.run_ipc_server()

if __name__ == "__main__":
    main()
