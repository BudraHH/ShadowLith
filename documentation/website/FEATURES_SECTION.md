# Section: The Triple-Threat Architecture (Core Capabilities)

## 1. Feature Pillar I: Ghost Stealth (The Invisibility)
- **Technical Label:** DirectX-Shield / WDA Integration.
- **Detailed Content:** ShadowLith utilizes the native `SetWindowDisplayAffinity` Windows API to apply a `WDA_EXCLUDEFROMCAPTURE` flag at the OS compositor level.
- **The Benefit:** Even if you share your "Entire Screen" on Zoom, Google Meet, or Discord, the HUD remains physically invisible in the stream. It exists only on your local display hardware.
- **Key Metric:** 0% Detection Rate by pixel-scraping or buffer-recording tools.

## 2. Feature Pillar II: Aural Intelligence (The Ears)
- **Technical Label:** Local NVIDIA Parakeet-TDT.
- **Detailed Content:** Integrated high-speed Speech-to-Text (STT) using the NVIDIA Parakeet-TDT 0.6B model. 
- **The Benefit:** Real-time transcription of system audio (Interviewer voice) without sending a single byte of audio to the cloud. It operates via the WASAPI Loopback interface for crystal-clear digital capture.
- **Key Metric:** < 100ms Latency between spoken word and text appearing on the HUD.

## 3. Feature Pillar III: Visual OCR (The Eyes)
- **Technical Label:** Native WinOCR / Screen-Reader.
- **Detailed Content:** A precision screen-scraping engine that leverages the `Windows.Media.Ocr` framework. 
- **The Benefit:** Instantly captures technical problems, code snippets, or MCQ questions from the screen. Zero dependency on Tesseract or external cloud OCR services.
- **Key Metric:** Sub-50ms text extraction from selected screen regions.

## 4. Integration Logic: The Semantic Bridge
- **Content:** All captured data (Visual + Aural) is fused into the **Gemini 2.5/3 Pro** logic engine.
- **The Result:** ShadowLith doesn't just show you text; it understands the context of the interview and provides definitive, professional-grade answers in real-time.

## 5. Visual Asset Requirement
- **Graphic Type:** A 3-part isometric diagram showing the data flow from Screen/Audio -> Local Processing -> Intelligence HUD.