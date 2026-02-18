# Documentation: The Shadow Archive (v1.2.4)

## 1. Quick Start & Installation
ShadowLith is distributed as a self-contained environment. 

### Automated Deployment
The recommended way to install is via our verified PowerShell script:
`iex (iwr -useb https://shadowlith.io/install.ps1)`

### Manual Requirements
- **OS:** Windows 10/11 (Build 19041+)
- **Runtime:** Microsoft Edge WebView2 (Standard on Win 11)
- **Hardware:** NVIDIA GPU (Recommended for 0ms Parakeet Latency)
- **API Access:** Valid Google Gemini API Key

---

## 2. Configuration (`.env`)
Before launching, configure your instance by editing the `.env` file in the root directory:

```env
# Intelligence Engine
GEMINI_API_KEY=your_key_here
MODEL_ID=gemini-2.5-flash-lite  # Options: gemini-2.5-pro, gemini-3-flash

# Environment
SHADOWLITH_DEBUG=False
WEBVIEW2_DEFAULT_BACKGROUND_COLOR=0  # Forces transparency
```

---

## 3. Command & Control (Hotkeys)
ShadowLith operates globally. You do not need to be focused on the window to execute commands.

| Command | Key Combo | Function |
| :--- | :--- | :--- |
| **Toggle HUD** | `Alt + Space` | Cycles visibility of the main transparent interface. |
| **Ghost Mode** | `Alt + Shift + Space` | Toggles click-through state. When active, you can interact with windows behind the HUD. |
| **Listen Mode** | `Alt + L` | Captures 10s of system audio and transcribes it locally. |
| **Visual Snip** | `Alt + S` | Triggers the regional selector for WinOCR text extraction. |

---

## 4. The Intelligence Schema
ShadowLith outputs analysis in a high-density JSON format designed for quick reading:

- **Summary:** Concise title of the problem.
- **Time/Space Complexity:** O-notation for algorithm optimization.
- **Blocks:** Modular units containing code, warnings, or step-by-step interview scripts.

---

## 5. Troubleshooting (Known Hurdles)

### "The White Background"
If the HUD appears as a solid white box:
- Ensure `transparent=True` is set in your `main.py`.
- Verify that the `WEBVIEW2_DEFAULT_BACKGROUND_COLOR` environment variable is set to `0` **before** the `webview` import.

### "No Audio Detected"
If Listen Mode returns an empty buffer:
- Open **Windows Sound Settings**.
- Ensure your default output device is set correctly.
- Verify that the "Stereo Mix" or WASAPI Loopback is not disabled by third-party drivers.

### "DPI / Scaling Issues"
If the regional snip is offset from your mouse:
- ShadowLith requires **DPI awareness**.
- The engine automatically calls `SetProcessDpiAwareness(1)`, but manual screen scaling over 150% may require `ctypes` adjustments in `snapper_win.py`.

---

## 6. Security Audit
- **Data Integrity:** Audio processed via local engine.
- **Capture Invisibility:** WDA flag `0x00000011` confirmed to block OBS, Zoom, and Proctorio.
- **Cleanup:** Temporary snips are stored in `src/screenshots/last_snip.png` and overwritten on every capture to prevent data accumulation.