# ShadowLith — Current Implementation Documentation

> **Version:** 2.0.0-MODULAR (Refined)  
> **Last Updated:** 2026-03-08  
> **Platform:** Windows Primary (High-DPI Optimized)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Backend](#backend)
   - [Entry Point](#entry-point-mainpy)
   - [Core Module](#core-module)
   - [Services Layer](#services-layer)
   - [Bridge (API Router)](#bridge-api-router)
   - [Engine Layer (Internal)](#engine-layer)
5. [Frontend](#frontend)
   - [Entry & State](#entry--state)
   - [Layouts](#layouts)
   - [Components](#components)
   - [Hooks & Utils](#hooks--utils)
   - [Styling](#styling)
6. [Data Flow & Workflows](#data-flow--workflows)
7. [Stealth & Stability Features](#stealth--stability-features)
8. [Window Management](#window-management)
9. [AI Response Schema & Robustness](#ai-response-schema--robustness)
10. [User Guide](#user-guide)
11. [File Index](#file-index)

---

## Overview

**ShadowLith** is an elite technical analysis desktop overlay designed for technical assessments and interviews. It operates as a transparent, always-on-top window that is **invisible to screen capture** tools. It intelligently orchestrates vision, audio, and AI processing to provide real-time assistance via a sleek, interactive HUD.

### Key Capabilities
- **Modular Intelligence:** Service-based architecture for AI, Vision, Window, and Audio.
- **Quota-Aware Orchestration:** Real-time API tracking using a **Sliding Window (Rolling 60s)** algorithm to match Gemini's rate limits precisely.
- **Model Waterfall Migration:** Automated fallback across tiered models (Flash -> Flash-Lite -> Preview) with seamless conversation history injection.
- **Multimodal Accumulation:** Collect multiple vision snippets and OCR text into a shared buffer before triggering a unified analysis.
- **Stealth First:** WDA (Window Display Affinity), Ghost styles, and masqueraded process identity.
- **Engine Stability:** Staggered boot sequence to prevent QT-backend deadlocks during high-DPI window styling.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      OPERATING SYSTEM                       │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              PyWebView (Qt Backend)                  │  │
│   │   ┌──────────────┐         ┌──────────────────────┐  │  │
│   │   │    Python    │         │   Qt WebEngine       │  │  │
│   │   │   Backend    │ <─────> │   (Chromium)         │  │  │
│   │   │ (Modular Svc)│         │                      │  │  │
│   │   │      js_api  │ <───────┤   React Frontend     │  │  │
│   │   └──────────────┘         │ (Vite + Tailwind 4)  │  │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                            │
│   ┌──────────────────┐       ┌────────────────────────────┐ │
│   │  Audio Sidecar   │       │  Snapper (PyQt6 Tool)      │ │
│   │  (Whisper IPC)   │       │  (Interactive Capture)     │ │
│   └──────────────────┘       └────────────────────────────┘ │
│                                                            │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                 Gemini API (Cloud Tiers)             │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend (Python)
| Component | Technology | Description |
|-----------|------------|-------------|
| Window Host | `pywebview` | Qt backend (PyQt6-WebEngine) |
| AI Engine | `google-genai` | Tiered: 2.5 Flash, 2.5 Flash-Lite, 3 Flash Preview |
| Screen Capture | `Pillow` (PIL) | Downscaled fast captures |
| OCR | `winsdk` | Native Windows Media OCR |
| Audio | `faster-whisper` | Tiny.en model in sidecar |
| Window Logic | `pywin32` | HWND, Style, and Affinity control |
| IPC | `socket` | TCP-based sidecar communication |

### Frontend (React)
| Component | Technology | Description |
|-----------|------------|-------------|
| Framework | React 19 | Latest concurrent features |
| CSS | Tailwind 4 | Modern utility-first styling |
| State | Zustand 5 | Decoupled high-performance state |
| Logic | JS (ESNext) | Robust stream parsing and pre-cleaning |

---

## Backend

### Entry Point (`main.py`)
Orchestrates service initialization and window lifecycle with stability guards.
1. **Boot Routine:** Implements a 2-second staggered delay to allow the QT engine to stabilize before applying native Win32 styles.
2. **Init Services:** Boots `AIService`, `VisionService`, `WindowService`, `AudioService`, and `PromptService`.
3. **Bridge:** Instantiates `ShadowLithAPI` as the `js_api`.
4. **Stealth Launch:** Applies `apply_stealth()` (Affinity) and `set_ghost_style` after the window handle is confirmed ready.

### Core Module

#### `core/config.py`
- **Tiered Models:** Loads `GEMINI_MODEL_1/2/3` from `.env` to build the fallback waterfall.
- **Key Pool:** Manages rotation across up to 10 Gemini keys.
- **Vision Thresholds:** Configures `OCR_CONTRAST` and `SCREENSHOT_QUALITY`.

#### `core/decorators.py`
- `@bridge_safe`: Protects the bridge from Python exceptions; ensures UI never hangs on backend errors.
- `@latency_timer`: Measures performance of critical paths like capture and analysis.

### Services Layer

#### `services/ai_service.py`
- **Sliding Window Tracker:** Uses a rolling 60s timestamp list (thread-safe) to monitor RPM. Decrements automatically in a background thread.
- **Model Waterfall:** When keys are exhausted for Tier 1, it migrates the session to Tier 2, etc.
- **History Migration:** Strictly preserves and injects chat history during model transitions.

#### `services/vision_service.py`
- **Interactive Snip:** Subprocess-based region tool (`Snapper`).
- **OCR:** Windows SDK integration with grayscale/contrast pre-processing.
- **Optimization:** Crops are converted to JPEG and downscaled to 1600px width to save API tokens.

#### `services/prompt_service.py`
- **JSON Robustness Rules:** Enforces a "No Double Quotes" policy in technical blocks. Commands AI to use single quotes (`'`) for code literals to prevent JSON breakout.
- **Multimodal Context:** Injects extracted OCR text as `ADDITIONAL TEXT CONTEXT` alongside visual snippets.

### Bridge (API Router)

#### `bridge/router.py`
- **Event Logging:** Records every button click and API action with timestamps for audit trails.
- **Thread Safety:** Uses `stream_lock` to take atomic snapshots of the `snip_buffer` before processing, preventing crashes during concurrent captures.
- **Session Control:** `reset_chat()` clears both the physical buffer and the AI's conversational memory.

---

## Frontend

### Entry & State
- **`App.jsx`**: Manages initial Mode/Context selection.
- **`MainLayout.jsx`**: Central coordinator for stream accumulation and UI state sync.
- **`useAppStore.js`**: Global state for panel toggles and mode settings.

### Hooks & Utils
- **`useAIStream.js`**: Features a **Robust JSON Pre-Cleaner** that surgically escapes unescaped quotes in code blocks before parsing.
- **`useWindowSync.js`**: Drives frame-perfect resizing of the OS window to match the React HUD footprint.
- **`useAudioIO.js`**: Handles push-based transcriptions and silence-triggered auto-processing.

---

## Data Flow & Workflows

### ⚡ Analyse Snippet (Accumulation Workflow)
1. User clicks **Analyse Snippet**.
2. **Backend Snapper** captures a crop.
3. Snip is added to a thread-safe **Buffer**.
4. UI **Capture Count** increments.
5. User can repeat to collect multiple images/texts.
6. **Process** button sends the entire buffer to the Tiered AI Service.

### 🛡️ Smart Reset Workflow
1. User clicks **Reset Session**.
2. **Frontend** clears all UI state (Chat, Results, History).
3. **Bridge** calls `reset_chat()`.
4. **Backend** wipes the `snip_buffer` and reconstructs a fresh `AIService` session, returning the model tier to Tier 1.

---

## Stealth & Stability Features

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| **Capture Stealth** | `WDA_EXCLUDEFROMCAPTURE` | Invisible to OBS/Teams/Screen-share. |
| **Focus Stealth** | `WS_EX_NOACTIVATE` | Click-through capability; doesn't steal focus. |
| **Startup Stability** | Staggered Boot Sequence | Prevents QT deadlocks on initialization. |
| **API Resilience** | Sliding Window + Waterfall | Precise rate-limit matching and 3-tier fallback. |
| **JSON Integrity** | Pre-Cleaner + Prompt Constraint | Prevents UI crashes from malformed AI code blocks. |

---

## AI Response Schema & Robustness

ShadowLith uses a strictly defined JSON block structure. To ensure parsing never fails:
1. **Instruction:** AI is forbidden from using `"` inside string values.
2. **Cleaning:** Frontend regex identifies top-level blocks and re-escapes internal content quotes.
3. **Streaming:** Partial JSON is handled via a quote-aware heuristic parser.

---

## User Guide

1. **Configuration:** Set up keys and model tiers in `.env`.
2. **Collection:** Use `Capture` for text or `Analyse Snippet` for visuals. Accumulate multiple items if the problem spans different areas.
3. **Execution:** Click `Process` to solve.
4. **Resilience:** Monitor the `API / 10` counter. The system will automatically switch models if you hit limits.

---

## File Index

### Backend
- `main.py`: Entry & Lifecycle
- `bridge/router.py`: Click Logging & Buffer Management
- `services/ai_service.py`: Sliding Window & Waterfall Migration
- `services/vision_service.py`: Multimodal & OCR Engine
- `services/prompt_service.py`: JSON Constraint Logic

### Frontend
- `src/layout/MainLayout.jsx`: Accumulation Logic
- `src/hooks/useAIStream.js`: JSON Pre-Cleaner
- `src/api/bridge.js`: Frontend-Backend Gateway
