# 🎧 Phase 8: Audio Intelligence ("The Ears")
> **Goal:** Hardware Tap & Real-Time Transcription

## 1. Overview
Phase 8 transforms **ShadowLith** from a visual-only assistant into a multi-modal "Triple-Threat." By tapping into the Windows **WASAPI Loopback** interface, the system can "hear" the interviewer's voice directly from the system audio. This audio is then processed locally using **NVIDIA Parakeet-TDT** (or similar optimized local models) to ensure zero-latency, high-accuracy transcription without cloud exposure.

## 2. Core Goals
- **System Audio Capture:** Implement a robust listener that captures speaker output (not just microphone) via Loopback.
- **Local ASR (Speech-to-Text):** Integrate the open-source NVIDIA Parakeet (or Faster-Whisper) model for offline transcription.
- **Noise Suppression:** Ensure the system ignores background static and only captures clean human speech at 16kHz.
- **Stealth Privacy:** Guarantee that no raw audio data leaves the local machine.

---

## 3. Technical Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Audio Capture** | `soundcard` | Low-level WASAPI Loopback access. |
| **ASR Model** | `NVIDIA Parakeet` / `Faster-Whisper` | Ultra-fast local transcription engine. |
| **Processing** | `PyTorch` / `CTranslate2` | Inference framework for the model. |
| **Data Format** | `NumPy` / `WAV` (PCM) | Mono, 16-bit, 16000Hz sampling. |

---

## 4. Architecture & Logic Flow

### A. The WASAPI Tap
Unlike standard recording, we utilize **Loopback Mode**. This captures the audio *after* it has been processed for the speakers, allowing ShadowLith to hear exactly what the user hears in their headset (e.g., the Interviewer's voice on Zoom/Teams).

### B. The Transcription Pipeline
1.  **Trigger:** User clicks **Listen** in the React HUD (or presses `Alt + L`).
2.  **Buffer:** `soundcard` begins a continuous sliding window recording.
3.  **Inference:** The raw signal is passed to the local ASR model.
4.  **Refinement:** The resulting text is sent to the Gemini Engine for technical contextualization.

---

## 5. Implementation Blueprint

### Step 1: Dependency Setup
Add the following to your Windows environment:

```powershell
pip install soundcard numpy faster-whisper
# Note: Requires CUDA for GPU acceleration; otherwise runs on CPU
```

### Step 2: The Listener Engine (`src/engine/listener.py`)

```python
import soundcard as sc
import numpy as np

class AudioListener:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        # Get the default speaker and its loopback microphone
        self.speaker = sc.default_speaker()
        
    def record_chunk(self, duration=10):
        """Records system audio for a specific duration."""
        # Note: on Windows, include_loopback=True is key
        with sc.get_microphone(id=str(self.speaker.name), include_loopback=True).recorder(samplerate=self.sample_rate) as mic:
            data = mic.record(numframes=self.sample_rate * duration)
            # Convert to mono if stereo
            if len(data.shape) > 1:
                data = np.mean(data, axis=1)
            return data
```

### Step 3: Local Integration

```python
from faster_whisper import WhisperModel

class WindowsTranscription:
    def __init__(self):
        # Local model loading (int8 quantization for speed)
        self.model = WhisperModel("tiny.en", device="cpu", compute_type="int8")

    def get_text(self, audio_data):
        # Fast local inference
        segments, info = self.model.transcribe(audio_data, beam_size=5)
        text = " ".join([segment.text for segment in segments])
        return text
```

---

## 6. Stealth & Security Features
- **Network Silence:** Transcription happens locally. Only the final text string is sent to Gemini.
- **Internal Routing:** The audio capture does not create a new "Recording" icon in the Windows System Tray (depending on privacy settings), maintaining a low profile.
- **Memory Management:** The model is loaded as a singleton to prevent VRAM spikes.

---

## 7. Success Criteria
- [ ] Successfully capture a 5-second system audio clip and save as .wav.
- [ ] Transcribe the clip with < 10% Word Error Rate (WER).
- [ ] Integrate the "Listen" button in the React Pill with a pulsing active state.
- [ ] Map the transcript output directly to the Gemini `get_answer()` logic.