---
name: Audio Streaming Pipeline
description: Implementation plan and research for real-time system audio capture and transcription
---

# Audio Streaming Pipeline

## Objective
Capture system audio (interviewer's voice) in real-time, transcribe it locally with low latency, and stream the text to the Gemini engine for analysis.

## Core Components

1.  **Audio Capture (Loopback)**
    *   **Library:** `soundcard` (Python)
    *   **Mechanism:** WASAPI Loopback (Windows Audio Session API)
    *   **Why:** Retrieves the exact digital audio stream being sent to the speakers/headphones. No microphone crosstalk.
    *   **Latency:** < 10ms buffer.

2.  **Voice Activity Detection (VAD)**
    *   **Library:** `webrtcvad` or `silero-vad` (Python)
    *   **Why:** To prevent sending silence/noise to the transcriber. Only triggers when human speech is detected.
    *   **Optimization:** Aggressive filtering (Mode 3) to ignore keyboard typing/breathing.

3.  **Transcription (STT)**
    *   **Engine:** `faster-whisper` (CTranslate2 implementation of Whisper)
    *   **Model:** `tiny.en` or `base.en` (Quantized int8)
    *   **Why:** Runs on CPU with < 200ms latency. GPU acceleration optional but supported.
    *   **Alternative:** `speech_recognition` (Google Web Speech API wrapper) - *Rejected due to API rate limits and network dependency.*

4.  **Integration (Gemini)**
    *   **Pipeline:**
        1.  Audio chunk -> VAD (Speech?) -> Yes
        2.  Accumulate chunks -> Transcribe -> "So, tell me about..."
        3.  Update `LiveTranscript` buffer in Python.
        4.  Push to React `ChatPanel` via `pywebview.api.emit`.
        5.  *Trigger:* User manually clicks "Analyze" OR (Auto-Mode) silence > 2s triggers send.

## Implementation Plan

### Step 1: Proof of Concept (Audio Capture)
- Create `tests/audio_loopback.py`.
- Verify we can record system audio to a `.wav` file.

### Step 2: Proof of Concept (Real-time Transcription)
- Create `tests/transcribe_stream.py`.
- Pipe `soundcard` output directly into `faster-whisper` stream.
- Measure latency.

### Step 3: Backend Integration
- Create `src/engine/audio_engine.py`.
- Class `AudioListener`: Spawns a dedicated thread for capture.
- Expose `start_listening()` and `stop_listening()` to `main.py`.

### Step 4: Frontend UI
- Update `MainLayout.jsx` "Listen" button.
- Add a "Live Transcript" mode to `ChatPanel.jsx`.
- Visualizer? (Optional: A simple expanding circle to show activity).

## Dependencies
```txt
soundcard
numpy
faster-whisper
```
