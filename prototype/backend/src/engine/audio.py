import subprocess
import threading
import os
import sys
import time
import socket
import json
from core.logger import logger

class AudioEngine:
    """
    ShadowLith Audio Intelligence Engine - Socket Manager (Optimized Push).
    """
    def __init__(self, port=6123, on_transcript=None):
        self.port = port
        self.on_transcript = on_transcript # Callback for real-time push
        self.process = None
        self.client_socket = None
        self.is_connecting = False
        self.transcript_buffer = []
        self._lock = threading.Lock()
        
        # Paths
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.backend_dir = os.path.abspath(os.path.join(self.current_dir, "..", ".."))
        self.service_path = os.path.join(self.backend_dir, "audio_service.py")
        
        logger.info(f"[AudioEngine] Initializing on Port {self.port} (Push Mode)")
        self._start_sidecar()

    def _start_sidecar(self):
        try:
            self.process = subprocess.Popen(
                [sys.executable, self.service_path, str(self.port)],
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE, 
                text=True,
                bufsize=1
            )
            self.is_connecting = True
            threading.Thread(target=self._connect_loop, name="AudioSockConn", daemon=True).start()
            threading.Thread(target=self._pipe_reader, name="AudioStdout", args=(self.process.stdout, "OUT"), daemon=True).start()
            threading.Thread(target=self._pipe_reader, name="AudioStderr", args=(self.process.stderr, "ERR"), daemon=True).start()
        except Exception as e:
            logger.error(f"[AudioEngine] Start failed: {e}")

    def _connect_loop(self):
        while self.process and self.process.poll() is None:
            if not self.client_socket:
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(2.0)
                    sock.connect(('127.0.0.1', self.port))
                    sock.settimeout(None) 
                    self.client_socket = sock
                    self.is_connecting = False
                    logger.info("[AudioEngine] Socket established.")
                    self._receive_loop()
                except:
                    time.sleep(1.0)
            else:
                time.sleep(2.0)

    def _receive_loop(self):
        buffer = ""
        try:
            while self.client_socket:
                data = self.client_socket.recv(4096).decode('utf-8')
                if not data: break
                
                buffer += data
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    if not line: continue
                    try:
                        msg = json.loads(line)
                        if msg.get("type") == "transcript":
                            text = msg.get("text")
                            # 1. Store locally for polling fallback
                            with self._lock:
                                self.transcript_buffer.append(text)
                            
                            # 2. Push in real-time if callback exists
                            if self.on_transcript:
                                self.on_transcript(text)
                                
                    except:
                        pass
        except:
            pass
        finally:
            self.client_socket = None

    def _pipe_reader(self, pipe, name):
        try:
            for line in iter(pipe.readline, ''):
                if not line: break
                clean = line.strip()
                if clean: logger.debug(f"[Sidecar-{name}] {clean}")
            pipe.close()
        except: pass

    def _send(self, cmd):
        wait = 0
        while self.is_connecting and wait < 10:
            time.sleep(0.5)
            wait += 1
        if not self.client_socket: return False
        try:
            self.client_socket.sendall(f"{cmd}\n".encode('utf-8'))
            return True
        except:
            self.client_socket = None
            return False

    def start_listening(self):
        return self._send("START")

    def stop_listening(self):
        return self._send("STOP")

    def get_transcript(self, clear_after=False):
        with self._lock:
            text = " ".join(self.transcript_buffer)
            if clear_after:
                self.transcript_buffer = []
            return text

    def terminate(self):
        self._send("QUIT")
        if self.process:
            try: self.process.terminate()
            except: pass
        self.client_socket = None
