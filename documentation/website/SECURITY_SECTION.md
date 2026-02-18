# Section: Security & The Local-First Protocol

## 1. Zero-Cloud Audio Policy
- **Core Message:** Your voice never leaves your room.
- **Detailed Content:** Unlike traditional AI assistants that stream raw audio to third-party servers, ShadowLith performs 100% of its speech recognition locally. 
- **The Tech:** We bundle the NVIDIA Parakeet-TDT weights. The transcription happens on your local GPU/CPU. 
- **Privacy Guarantee:** No audio recordings are stored, cached, or transmitted.

## 2. On-Device Visual Processing
- **Core Message:** Local eyes, private analysis.
- **Detailed Content:** Every screenshot captured by the "Eyes" module is processed using the native Windows OCR library. 
- **The Tech:** Pixel data stays within the system RAM and is purged immediately after the text is extracted.
- **Privacy Guarantee:** ShadowLith does not maintain a library of your screen captures.

## 3. Encrypted Intelligence Bridge
- **Core Message:** Minimal data footprint.
- **Detailed Content:** Only the final extracted text (the question) is sent to the LLM engine for analysis.
- **The Tech:** All transmissions are wrapped in industry-standard TLS 1.3 encryption.
- **Privacy Guarantee:** We use "Contextual Anonymization"—ensuring that personal identifiers are filtered before reaching the intelligence layer.

## 4. Anti-Heuristic Stealth
- **Core Message:** Silent operation.
- **Detailed Content:** ShadowLith is engineered to leave zero trace in the Windows Taskbar, System Tray, or the list of "Currently Recording" applications. 
- **The Tech:** By utilizing low-level Win32 hooks and avoiding standard GUI frameworks (like Electron), ShadowLith remains below the detection threshold of modern proctoring heuristics.

## 5. Open Source Auditability
- **Core Message:** Trust through transparency.
- **Detailed Content:** ShadowLith is open-core. We provide the source code for our capture and stealth modules so the community can verify our privacy claims.
- **Actionable Link:** [View the Security Audit on GitHub]