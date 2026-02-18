# 🔨 Phase 9: Final Integration & Deployment ("The Forge")
> **Goal:** Consolidation, Compilation & Stealth Distribution

## 1. Overview
Phase 9 is the consolidation of the entire **ShadowLith** ecosystem. We transition from running multiple Python scripts and a dev-server to a single, optimized Windows binary (`.exe`). This phase ensures that the Stealth Mode, WinOCR, and Audio ASR all launch in a unified process, managed by a robust PowerShell installation routine.

## 2. Core Goals
- **Unified Entry Point:** Refine `main.py` to initialize all three engines (Gemini, WinOCR, Audio) as persistent services.
- **Production Build:** Compile the React UI into static assets and bundle the Python environment using `Nuitka`.
- **Resource Optimization:** Implement "Lazy Loading" for the ASR model to keep the startup footprint managed.
- **Automated Setup:** Create a `setup.ps1` script to handle Windows-specific dependencies (WebView2, Python, pip).

---

## 3. Technical Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Bundler** | `Nuitka` | Compiles Python to a C++ binary (Better stealth/performance). |
| **UI Build** | `Vite` / `React` | Optimized production build of the HUD. |
| **Automation** | `PowerShell 7` | Handles environment configuration and dependency checks. |
| **CI/CD** | `GitHub Actions` | Automated build pipeline for binary releases. |

---

## 4. Architecture & Logic Flow

### A. The "Ghost" Lifecycle
1.  **Bootstrap:** `setup.ps1` checks for the WebView2 runtime and sets up the local database for chat history.
2.  **Launch:** The binary starts in "Stealth Mode" (Hidden from taskbar).
3.  **The Watcher:** A Global Hotkey listener remains active in the background to trigger the HUD.

### B. Final Integration Flow
- **Visual Snipping:** `snapper_win.py` → WinOCR → ShadowLithEngine → React HUD.
- **Auditory Capture:** `listener.py` → Whisper/Parakeet → ShadowLithEngine → React HUD.

---

## 5. Implementation Blueprint

### Step 1: Production UI Build
Compile your React HUD into the `ui/` directory so it can be served locally by `pywebview` without a dev-server.

```powershell
cd ui
npm run build
```

### Step 2: Unified Main Wrapper (`main.py`)
Ensure the production pathing points to the dist folder:

```python
if getattr(sys, 'frozen', False):
    # Running in a bundle (.exe)
    BASE_DIR = sys._MEIPASS
else:
    # Running in normal python
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

url = os.path.join(BASE_DIR, "ui", "dist", "index.html")
```

### Step 3: PowerShell Setup Script (`setup.ps1`)

```powershell
Write-Host "Initializing ShadowLith Environment..." -ForegroundColor Cyan

# Check for Python
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python not found. Please install Python 3.11+"
    exit
}

# Install Dependencies
pip install -r requirements.txt

# Download Weights (Optional pre-fetch)
# python -c "import faster_whisper; faster_whisper.download_model('tiny.en')"

Write-Host "Setup Complete. Launch via 'python main.py' or run the .exe" -ForegroundColor Green
```

---

## 6. Deployment & Distribution
- **Obfuscation:** Use Nuitka with the `--standalone` and `--onefile` flags to make the source code difficult to reverse-engineer.
- **Iconography:** Apply the custom ShadowLith `.ico` to the binary to complete the professional look.
- **Documentation:** Finalize the `README.md` to include instructions for the "Listen" and "Ghost" hotkeys.

---

## 7. Success Criteria
- [ ] Application compiles to a single `.exe` under 1.5GB (including model weights).
- [ ] Stealth Mode (WDA) is confirmed active on the compiled binary.
- [ ] The app launches without requiring an active terminal window.
- [ ] All "Triple-Threat" features function seamlessly in the bundled state.