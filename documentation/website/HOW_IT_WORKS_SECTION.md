# Section: How It Works (The Shadow Engine)

## 1. Step I: The Silent Capture
- **Mechanism:** Using WASAPI Loopback and Win32 Hooks.
- **Content:** When the user initiates a session, ShadowLith creates a virtual "tap" into the Windows audio pipeline and a "listener" on the screen compositor. 
- **The Tech:** It bypasses standard recording routes to capture the digital signal directly from the speaker buffer and the GPU frame buffer.

## 2. Step II: Local Intelligence Fusion
- **Mechanism:** On-Device ASR & OCR.
- **Content:** Raw audio bytes are fed into the **NVIDIA Parakeet-TDT** model on your GPU, while screen pixels are scanned by the native **Windows OCR** engine.
- **The Advantage:** Because this processing happens 100% locally, the latency is nearly zero, and no "proctoring signatures" are created by sending data to a cloud.

## 3. Step III: The Semantic Analysis
- **Mechanism:** Gemini 2.5/3 Pro Logic Engine.
- **Content:** The transcribed text and extracted visuals are combined into a high-density prompt. The engine filters out "interviewer fluff" and focuses on the core technical problem.
- **The Result:** The system generates a structured JSON response containing the summary, time complexity, and a professional-grade script for the user to follow.

## 4. Step IV: The Invisible HUD Delivery
- **Mechanism:** Windows Display Affinity (WDA) Overlay.
- **Content:** The analyzed answer is rendered in the React-based HUD. This HUD is wrapped in a "Stealth Layer" that makes it visible to the user but mathematically transparent to screen-capture tools like Zoom or Google Meet.
- **The Loop:** This entire cycle from "Hearing" to "Displaying" happens in under 2 seconds.

## 5. Visual Asset Requirement
- **Graphic Type:** A "Data Flow" animation showing three distinct paths (Audio, Video, Intelligence) converging into a single HUD.