# ShadowLith — Current Implementation Documentation

> **Version:** 2.0.0-MODULAR  
> **Last Updated:** 2026-02-28  
> **Platform:** Windows only

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
   - [Engine Layer (Legacy/Low-Level)](#engine-layer)
5. [Frontend](#frontend)
   - [Entry & Routing](#entry--routing)
   - [Layouts](#layouts)
   - [Components](#components)
   - [Hooks](#hooks)
   - [Store](#store)
   - [Utilities](#utilities)
   - [Styling](#styling)
6. [Data Flow & Workflows](#data-flow--workflows)
   - [Application Startup](#1-application-startup)
   - [Screen Capture → AI Analysis](#2-screen-capture--ai-analysis)
   - [Chat Conversation](#3-chat-conversation)
   - [Audio Transcription (Interview Mode)](#4-audio-transcription-interview-mode)
7. [Stealth Features](#stealth-features)
8. [Window Management](#window-management)
9. [AI Response Schema](#ai-response-schema)
10. [Block Types & Rendering](#block-types--rendering)
11. [User Guide](#user-guide)
12. [File Index](#file-index)

---

## Overview

**ShadowLith** is a stealth desktop overlay application designed to assist users during technical assessments and interviews. It sits as an always-on-top, transparent, frameless window that is **invisible to screen capture** (Windows Display Affinity). The application captures the user's screen, sends it to Google's Gemini AI for analysis, and displays structured results — including code solutions, explanations, strategies, and interview scripts — in a sleek overlay panel.

### Key Capabilities
- **Screen Capture & Analysis:** Full-screen or region-based (snip) capture, processed by Gemini AI
- **Live AI Chat:** Interactive chat panel for follow-up questions with contextual awareness
- **Real-Time Audio Transcription:** Microphone listening for interview scenarios with auto-analysis on silence detection
- **Stealth Mode:** Hidden from screen capture, taskbar, and Alt+Tab
- **Multiple Modes:** Assessment mode (coding/MCQ/video) and Interview mode (grounded in user's resume + JD)
- **API Key Rotation:** Automatic failover across up to 10 Gemini API keys on quota exhaustion
- **Window Sync:** OS window dynamically resizes to match rendered UI content

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    OPERATING SYSTEM                      │
│   ┌──────────────────────────────────────────────────┐  │
│   │              PyWebView (Qt Backend)               │  │
│   │   ┌──────────────┐     ┌──────────────────────┐  │  │
│   │   │    Python     │     │   Qt WebEngine       │  │  │
│   │   │   Backend     │◄───►│   (Chromium-based)   │  │  │
│   │   │              │     │                      │  │  │
│   │   │  js_api ◄────┼─────┤   React Frontend     │  │  │
│   │   │  (bridge)    │     │   (Vite + Tailwind)  │  │  │
│   │   └──────────────┘     └──────────────────────┘  │  │
│   └──────────────────────────────────────────────────┘  │
│                                                          │
│   ┌──────────────────┐   ┌────────────────────────────┐ │
│   │  Audio Sidecar   │   │  Snapper (Snip Tool)       │ │
│   │  (subprocess)    │   │  (subprocess, PyQt6)       │ │
│   └──────────────────┘   └────────────────────────────┘ │
│                                                          │
│   ┌──────────────────────────────────────────────────┐  │
│   │              Gemini API (Cloud)                   │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Communication Pattern
- **Frontend → Backend:** Via `window.pywebview.api.*` (synchronous bridge calls exposed through `js_api`)
- **Backend → Frontend:** Via `window.evaluate_js()` (direct JS injection for streaming chunks and transcripts)
- **Audio Sidecar:** Separate Python subprocess communicating over TCP socket (port 6123)
- **Snip Tool:** Separate PyQt6 subprocess that captures a screen region and writes to `screenshots/last_snip.png`

---

## Tech Stack

### Backend (Python)
| Component | Technology |
|-----------|-----------|
| Window Host | `pywebview` (Qt backend via PyQt6-WebEngine) |
| AI Engine | Google `google-genai` SDK (Gemini 2.5 Flash) |
| Screen Capture | `Pillow` (ImageGrab) |
| OCR | Windows SDK (`winsdk`) OcrEngine |
| Snip Tool | `PyQt6` (QWidget fullscreen overlay) |
| Audio | Custom sidecar subprocess + TCP socket |
| Global Hotkeys | `pynput` |
| Window Manipulation | `pywin32` (win32gui, win32con) |
| Environment | `python-dotenv` |

### Frontend (JavaScript/React)
| Component | Technology |
|-----------|-----------|
| Framework | React 19.2 |
| Build Tool | Vite 7.3 |
| CSS | Tailwind CSS 4.1 (via `@tailwindcss/vite`) |
| State Management | Zustand 5.0 |
| Icons | Lucide React |
| Syntax Highlighting | `react-syntax-highlighter` (Prism, VSCode Dark+) |
| Drag Support | `react-draggable` |

---

## Backend

### Entry Point (`main.py`)

The application entry point that orchestrates all services and launches the PyWebView window.

**Startup Sequence:**
1. Set stability flags (`KMP_DUPLICATE_LIB_OK`, `OMP_NUM_THREADS`)
2. Install global exception handler
3. Initialize all services → create `ShadowLithAPI` (the bridge object)
4. Determine frontend URL (dev server at `http://127.0.0.1:5174` or production build from `ui/index.html`)
5. Create PyWebView window with:
   - `frameless=True`, `transparent=True`, `on_top=True`
   - `js_api=api` (exposes Python methods to JavaScript)
   - `background_color='#030303'` (prevents white flash)
6. On window ready (`shown` event):
   - **Stealth Init** (1s delay, then applies WDA + ghost style with interactive=True)
   - **Hotkey Loop** (registers `Alt+Z` → toggle visibility, `Ctrl+Alt+K` → terminate)
7. Start WebView with `gui='qt'` and `debug=Config.DEBUG`

### Core Module

#### `core/config.py`
Central configuration loaded from `.env`:
- **App Identity:** Name masqueraded as `"Microsoft Edge WebView2 Helper"` (stealth)
- **Paths:** Backend dir, screenshots dir, log file, snapper path
- **API Keys:** Loads `GEMINI_API_KEY_1` through `GEMINI_API_KEY_10` from the environment
- **Model:** `gemini-2.5-flash`
- **Debug:** Controlled by `SHADOWLITH_DEBUG` env var; uses `SHADOWLITH_DEBUG_URL` for dev server

#### `core/logger.py`
Singleton logger (`"ShadowLith"`) with:
- Console output (stdout)
- File output (`shadowlith.log`)
- Format: `[HH:MM:SS] LEVEL [ShadowLith.function:line] message`
- Level: DEBUG in debug mode, INFO otherwise

#### `core/decorators.py`
Two decorators used across the codebase:
- **`@bridge_safe`**: Wraps bridge methods in try/except, returns structured error JSON on failure instead of crashing the UI
- **`@latency_timer`**: Measures and logs execution time of critical functions in milliseconds

### Services Layer

#### `services/ai_service.py` — AIService
Manages Gemini AI orchestration.

- **Key Rotation:** Maintains `_key_index`, cycles through all configured keys on quota errors (429, 503, "exhausted", "overloaded")
- **Session Management:**
  - `_rebuild_session(history)`: Creates a new `genai.Client` + chat session with system instruction, `temperature=0.1`, and JSON response MIME type
  - Preserves chat history across key rotations
- **Streaming:** `ask_stream(message, image_base64=None)` — generator that yields text chunks from Gemini's streaming API
  - Supports multimodal (text + image) via `types.Part.from_bytes`
  - On recoverable errors, rotates key and retries up to `len(keys)` times
  - On fatal errors, yields error JSON
- **Reset:** `reset_session()` — clears chat history (called when user context changes)

#### `services/vision_service.py` — VisionService
Handle all visual input processing.

- **OCR Engine:** Pre-warms Windows OCR at init using `OcrEngine.try_create_from_user_profile_languages()`
- **`capture_fullscreen()`:** PIL `ImageGrab.grab()` → downscale if >1600px wide → JPEG encode → base64 → returns `{"type": "image", "data": "<b64>"}`
- **`capture_with_snip()`:** Launches `snapper_win.py` as subprocess → waits for `SUCCESS` in stdout → reads `last_snip.png` → preprocesses (grayscale + 2.5x contrast) → runs OCR → returns `{"type": "text", "data": "<ocr_text>"}` or falls back to image if OCR is empty
- **`preprocess_image()`:** Grayscale + contrast enhancement for OCR accuracy
- **`run_ocr(image_bytes)`:** Async Windows SDK OCR via `BitmapDecoder` → `recognize_async`

#### `services/window_service.py` — WindowService
Win32 window manipulation.

- **`get_hwnd(title)`:** Finds window handle by title (defaults to the masqueraded app name)
- **`apply_stealth(hwnd)`:** Sets `WDA_EXCLUDEFROMCAPTURE` (0x11) via `SetWindowDisplayAffinity` — makes the window invisible to all screen capture tools
- **`set_ghost_style(interactive, hwnd)`:** Modifies extended window styles:
  - Always adds `WS_EX_TOOLWINDOW` (hides from taskbar/Alt+Tab)
  - Always removes `WS_EX_APPWINDOW`
  - When `interactive=False`: adds `WS_EX_NOACTIVATE` (window can't be activated by clicking)
  - When `interactive=True`: removes `WS_EX_NOACTIVATE`
  - Calls `SetWindowPos` with `SWP_FRAMECHANGED` to force style refresh
- **`force_focus(hwnd)`:** Calls `SetForegroundWindow` to bring the window to front

#### `services/audio_service.py` — AudioService
Lazy-loading wrapper for the AudioEngine.

- Initializes the AudioEngine only on first use (`_ensure_engine()`) to avoid startup lag
- **`set_on_transcript(callback)`:** Registers a callback for real-time transcript push (used to inject text into the UI via `evaluate_js`)
- **`start_listening()` / `stop_listening()`:** Start/stop mic capture in daemon threads
- **`get_transcript(clear)`:** Polling fallback for transcript retrieval
- **`terminate()`:** Kills the audio sidecar process

#### `services/prompt_service.py` — PromptService
Manages system instructions and prompt construction.

- **System Instruction:** Defines ShadowLith's AI persona with:
  - Core rules: JSON-only output, dual-destination routing (text → chat, technical → response)
  - Schema definition for the blocks format
  - Tone guidance: simple, natural English
  - User context: resume + job description (for Interview mode)
- **`build_analysis_prompt(mode, language, scenario, transcript, is_audit)`:** Constructs the task prompt based on mode:
  - Assessment/Coding: outputs problem, strategy, code blocks
  - Assessment/MCQ: outputs option + problem blocks
  - Assessment/Video: outputs problem + interview blocks
  - Interview: prioritizes interview (script) blocks
  - Audit: compares progress against previous solution
- **`build_chat_prompt(message, is_interview_mode)`:** Wraps user message with task context
- **`update_context(resume, jd)`:** Updates user context and regenerates system instruction

### Bridge (API Router)

#### `bridge/router.py` — ShadowLithAPI
The central API class exposed to the frontend via PyWebView's `js_api`. Every public method is callable from JavaScript via `window.pywebview.api.<method_name>()`.

**Exposed Methods:**

| Method | Called From | Description |
|--------|-----------|-------------|
| `toggle_ui()` | Alt+Z hotkey | Shows/hides the window |
| `set_ghost_mode(enabled)` | Frontend | Toggles WS_EX_NOACTIVATE |
| `set_interactivity(is_interactive)` | Frontend (mouseEnter) | Same as ghost mode but with focus handling |
| `sync_window_size(width, height, dpr)` | useWindowSync hook | Resizes OS window to match UI content |
| `set_user_context(resume, jd)` | ContextSetup page | Sets resume/JD, resets AI session |
| `capture_fullscreen()` | ControlBar "Analyse Screen" | Captures full screen, adds to `snip_buffer` |
| `capture()` | ControlBar "Capture" | Interactive snip tool, adds to `snip_buffer` |
| `revoke_snip()` | ControlBar "Clear" / auto after response | Clears `snip_buffer` |
| `chat(message, is_interview_mode, stream_id)` | ChatPanel send | Starts chat stream |
| `start_stream_answer(mode, language, scenario, transcript, is_audit, stream_id)` | ControlBar "Process" | Starts analysis stream using latest snip |
| `stop_stream()` | Stop button | Sets `stop_requested` flag |
| `start_listening()` | ControlBar "Listen" | Starts audio capture |
| `stop_listening()` | ControlBar "Listen" toggle | Stops audio capture |
| `get_live_transcript()` | (Legacy polling) | Gets buffered transcript text |
| `terminate_app()` | Quit button / Ctrl+Alt+K | Terminates audio and exits process |

**Streaming Architecture:**
- `_start_stream(message, image_base64, stream_id)` spawns a daemon thread
- Uses `self.stream_lock` (threading.Lock) for concurrency control
- On each chunk from `ai.ask_stream()`:
  - Checks `stop_requested` flag
  - Injects chunk into frontend via `evaluate_js("window.__onStreamChunk(chunk, streamId)")`
- On stream end: injects `window.__onStreamEnd(streamId)` into frontend

**Real-Time Audio Push:**
- The `set_window` method registers a `push_transcript` callback
- When audio transcript arrives, it's pushed to the frontend via `evaluate_js("window.__onTranscript(text)")`

### Engine Layer

#### `src/engine/audio.py` — AudioEngine
Low-level audio transcription engine using a subprocess sidecar architecture.

- Starts `audio_service.py` as a subprocess
- Communicates over TCP socket on port 6123
- Receives JSON messages: `{"type": "transcript", "text": "..."}`
- Pushes transcripts to the registered callback in real-time
- Supports commands: `START`, `STOP`, `QUIT`

#### `src/snapper_win.py` — SnapperWin
PyQt6-based interactive screen snipping tool.

- Launches as a fullscreen overlay
- Captures the entire screen as a pixmap background
- User draws a selection rectangle (dimming the outside area with a "spotlight" effect)
- On release: crops the selection, saves to `screenshots/last_snip.png`, prints `SUCCESS`
- Escape key cancels
- Also applies `WDA_EXCLUDEFROMCAPTURE` to itself (stealth even during snipping)

#### `windows_engine.py` — WindowsEngine (Legacy)
Original monolithic engine class — retained for reference but superseded by the modular services. Contains OCR, window manipulation, and ghost style functions.

---

## Frontend

### Entry & Routing

#### `main.jsx`
React root — renders `<App />` inside `<StrictMode>`.

#### `App.jsx`
Top-level router with 3 screens, controlled by state:

```
[ModeSelection] → (Assessment) → [MainLayout]
                → (Interview)  → [ContextSetup] → [MainLayout]
```

- **`ModeSelection`:** Choose between "Assessment" and "Interview"
- **`ContextSetup`:** (Interview only) Paste resume + job description → sends to backend via `set_user_context`
- **`MainLayout`:** The main operational interface

After mode selection / context setup, `set_interactivity(false)` was called (legacy behavior — this is what originally caused the textarea deadlock).

### Layouts

#### `MainLayout.jsx`
The main operational screen. Contains all state and handlers.

**State Management:**
- Local state: `mode`, `captureCount`, `language`, `scenario`, `data`, `history`, `historyIndex`, `chatMessages`, UI toggles
- Zustand store: `showChat`, `showResponse` (to avoid cross-component re-renders)

**Key Handlers:**
- `handleProcess(isManual, transcript)`: Captures screen (if manual + no existing capture) → starts analysis stream → clears transcript
- `handleSendMessage(message)`: Adds user message to chat → starts chat stream
- `handleCapture()`: Launches interactive snip tool
- `handleClear()`: Revokes snips, resets all state

**Layout Structure:**
```
main-layout-root (960px wide, opacity transition on hover)
├── TopBar (drag region, clock, mode/language/scenario selectors, hide/quit)
└── Dashboard (collapsible)
    ├── ControlBar (action buttons, chat toggle, panels toggle)
    ├── TranscriptTicker (when listening, shows live audio ticker)
    └── ContentArea (collapsible)
        ├── ResponsePanel (3/5 width when chat open, full otherwise)
        └── ChatPanel (2/5 width, conditional)
```

**Interactivity:** Mouse enter on root div calls `bridge.setInteractivity(true)` as a safety net.

#### `ResponsePanel.jsx`
Displays AI analysis results with:
- Header: title, history navigation (prev/next version), syncing indicator, sort toggle, collapse toggle
- Content: streaming view (live blocks + processing indicator) OR finalized block rendering OR idle state
- Interview mode sorts blocks by priority (interview → strategy → others)

#### `ChatPanel.jsx`
Wrapper for the chat window with:
- Header: "Intelligence Chat" label + clear (trash) button
- Content: `ChatWindow` component

### Components

#### `ChatWindow.jsx`
Full chat interface with:
- Message display: user messages (blue) and assistant messages (gray), with support for array block content
- Live streaming display: shows text blocks from partial stream with animated cursor
- Thinking indicator: animated bouncing dots when processing with no chunks yet
- Input: auto-growing textarea (38px → 86px max) + send/stop button
- Enter to send, Shift+Enter for newline, Enter during processing → stop

#### `CodeBlock.jsx`
Syntax-highlighted code display using Prism (VSCode Dark+ theme) with:
- Collapsible header showing language name + streaming indicator
- Copy button with **stealth fallback** — uses hidden textarea + `execCommand('copy')` instead of `navigator.clipboard` to avoid Qt permission crash
- Expandable/collapsible code content

#### `TextBlock.jsx`
Text renderer with basic markdown support:
- `**bold**` and `__bold__`
- `*italic*` and `_italic_`
- `` `inline code` ``
- Streaming cursor animation

#### `ProblemBlock.jsx`
Collapsible explanation block with 📝 header.

#### `StrategyBlock.jsx`
Collapsible strategy block with 🎯 header, italic styling.

#### `InterviewBlock.jsx`
Answer script display with ⭐ header. Large text (18px) with bold keyword highlighting in amber. Designed for at-a-glance reading during interviews.

#### `AnalysisBlock.jsx`
Performance metrics display showing:
- Time complexity (emerald colored)
- Space complexity (blue colored)
- Collapsible with label

#### `StepsBlock.jsx`
Numbered implementation steps with:
- Automatic flattening of newline-separated numbered lists
- Numbered circle markers with hover effects
- Blue left border accent

#### `OptionBlock.jsx`
MCQ answer display with label (e.g., `[B]`) in amber.

#### UI Components

- **`TopBar.jsx`:** Drag region with: app name, snippet count badge, clock, Select dropdowns (language, scenario, mode), Hide/Quit buttons, dashboard toggle
- **`ControlBar.jsx`:** Drag region with: dynamic action buttons (passed as `items` prop), Chat toggle button (via Zustand), panels collapse toggle
- **`WindowBar.jsx`:** Minimal title bar used on ModeSelection and ContextSetup pages (ShadowLith dot + minimize/close)
- **`Select.jsx`:** Custom dropdown component with open/close animation, used for mode/language/scenario selection
- **`Button.jsx`:** Reusable button with variants: primary, secondary, outline, danger, ghost

### Hooks

#### `useAIStream.js`
Core streaming hook managing real-time AI responses.

- **State:** `streamingText`, `isResponseProcessing`, `isChatProcessing`
- **Refs:** `accumTextRef` (chunk accumulator), `currentStreamIdRef`, `streamTypeRef`
- **Global handlers:** Registers `window.__onStreamChunk(chunk, streamId)` and `window.__onStreamEnd(streamId)` — these are called by the Python backend via `evaluate_js`
- **Stream ID matching:** Ignores chunks from stale streams
- **On stream end:** Parses accumulated text as JSON → strips markdown fences → extracts `{blocks:[...]}` → routes:
  - Text blocks → `onChatResult` callback (→ chat messages)
  - Technical blocks → `onResponseResult` callback (→ response panel + history)
  - On parse error: shows quota/engine error message

#### `useAudioIO.js`
Audio transcription management with silence detection.

- Registers `window.__onTranscript(text)` for real-time push from backend
- Accumulates transcript text in state + ref
- **Silence detection:** 10-second interval ticks; after 4 ticks (40s) of silence with >15 chars of transcript, auto-triggers `onSilenceDetected` callback (which calls `handleProcess`)
- Returns: `isListening`, `liveTranscript`, `setLiveTranscript`, `toggleListening`

#### `useWindowSync.js`
Automatic OS window size synchronization.

- Observes a DOM element by ID using `ResizeObserver`
- On size change: measures `getBoundingClientRect()`, multiplies by DPR, sends to backend via `bridge.syncWindowSize`
- 50ms debounce via `setTimeout`
- Used by `MainLayout` to keep the OS window tightly wrapped around content

#### `useWindowResizeSync.js`
Alternative/older window sync hook used by `ModeSelection` and `ContextSetup`:
- Uses `offsetWidth`/`offsetHeight` instead of `getBoundingClientRect`
- Adds small buffer (+2px width, +5px height) for non-main layouts
- Throttled at ~15 FPS (66ms interval)

### Store

#### `useAppStore.js` (Zustand)
Minimal global store with standalone actions to avoid unnecessary re-renders:

```js
State: { mode, showChat, showResponse }
Actions: setModeAction, setShowChatAction, setShowResponseAction
```

Actions are exported as standalone functions (not in the store object), so calling them doesn't trigger subscriptions.

### Utilities

#### `blockRenderer.jsx`
Maps block type strings to React components:
- `text` → TextBlock
- `code` → CodeBlock
- `option` → OptionBlock
- `analysis` → AnalysisBlock
- `interview` → InterviewBlock
- `problem` → ProblemBlock
- `strategy` → StrategyBlock
- `step` → StepsBlock (grouped: consecutive step blocks are merged)

#### `streamParser.js`
Heuristic parser for partial JSON streams from Gemini.
- Handles incomplete/unclosed blocks
- Quote-aware brace tracking (avoids confusion from JSON-escaped characters in code blocks, e.g., LaTeX braces)
- Extracts `type`, `content`, `lang`, `label` from each block object
- Unescapes common JSON escapes (`\n`, `\"`, `\\`, `\t`)

#### `useTypedStream.js`
Typing effect hook that buffers incoming text and emits 1-3 characters at a time at configurable speed (default 10ms per char).

#### `constants.js`
Mock data for development/testing containing example MCQ and coding problem responses.

### Styling

#### `index.css`
Global styles using Tailwind CSS v4:
- **Base:** Transparent background, hidden overflow, `cursor: default` globally, DPR-aware font sizing
- **`.select-text`:** Allows text selection where needed
- **Scrollbar utilities:** `.thin-scrollbar` (3px), `.custom-scrollbar` (4px), `.no-scrollbar` (hidden)
- **Transcript ticker scrollbar:** 2px emerald, hidden until container hover

---

## Data Flow & Workflows

### 1. Application Startup

```
User runs: python main.py
  │
  ├─ Services initialize (AI, Vision, Window, Audio, Prompt)
  ├─ PyWebView window created (frameless, transparent, on-top)
  ├─ Frontend loads (Vite dev server or built HTML)
  │
  ├─ [Window Ready Event]
  │   ├─ Thread: stealth_init() → apply_stealth() + set_ghost_style(interactive=True)
  │   └─ Thread: hotkey_loop() → registers Alt+Z, Ctrl+Alt+K
  │
  └─ Frontend shows ModeSelection screen
      ├─ User clicks "Assessment" → MainLayout
      └─ User clicks "Interview" → ContextSetup → (paste resume + JD) → MainLayout
```

### 2. Screen Capture → AI Analysis

```
User clicks "Analyse Screen" (or "Process" with existing capture)
  │
  ├─ Frontend: ai.startStream('analysis') → isResponseProcessing = true
  ├─ Frontend: bridge.captureFullscreen() → Python PIL.ImageGrab → base64 JPEG → snip_buffer
  ├─ Frontend: bridge.startStreamAnswer({mode, language, scenario, ...})
  │
  ├─ Backend: prompt_service.build_analysis_prompt() → formatted prompt
  ├─ Backend: Thread → ai_service.ask_stream(prompt, image) → Gemini API streaming
  │   │
  │   ├─ For each chunk:
  │   │   └─ evaluate_js("window.__onStreamChunk(chunk, streamId)")
  │   │       └─ Frontend: accumTextRef += chunk → streamingText updated → live rendering
  │   │
  │   └─ On end:
  │       └─ evaluate_js("window.__onStreamEnd(streamId)")
  │           └─ Frontend: parse JSON → route blocks → update data/history/chat
  │               └─ bridge.revokeSnip() → clear snip_buffer → captureCount = 0
  │
  └─ isResponseProcessing = false
```

### 3. Chat Conversation

```
User types message in ChatPanel textarea → hits Enter
  │
  ├─ Frontend: message added to chatMessages
  ├─ Frontend: ai.startStream('chat') → isChatProcessing = true
  ├─ Frontend: bridge.chat(message, isInterviewMode, streamId)
  │
  ├─ Backend: prompt_service.build_chat_prompt() → formatted prompt
  ├─ Backend: Thread → ai.ask_stream(prompt) → Gemini streaming
  │   │
  │   ├─ Chunks pushed via __onStreamChunk → live display in ChatWindow
  │   └─ End via __onStreamEnd → parse → text blocks to chat, tech blocks to response
  │
  └─ isChatProcessing = false
```

### 4. Audio Transcription (Interview Mode)

```
User clicks "Listen" in ControlBar
  │
  ├─ Frontend: bridge.startListening() → Backend: audio.start_listening()
  ├─ AudioEngine sends "START" to sidecar → sidecar begins mic capture
  │
  ├─ Sidecar → JSON {"type":"transcript","text":"..."} over TCP socket
  │   └─ AudioEngine._receive_loop() → callback → evaluate_js("window.__onTranscript(text)")
  │       └─ Frontend: useAudioIO → liveTranscript updated → TranscriptTicker shows text
  │
  ├─ Silence Detection (useAudioIO):
  │   └─ After 40s of silence + >15 chars → auto-trigger handleProcess()
  │       └─ (Same flow as Screen Capture → AI Analysis)
  │
  └─ User clicks "Listen" again → bridge.stopListening() → sidecar stops
```

---

## Stealth Features

| Feature | Implementation |
|---------|---------------|
| **Screen Capture Invisibility** | `SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)` — window is invisible to all screen recording/sharing tools |
| **Taskbar Hidden** | `WS_EX_TOOLWINDOW` extended style — no taskbar button |
| **Alt+Tab Hidden** | `WS_EX_TOOLWINDOW` combined with removing `WS_EX_APPWINDOW` |
| **Process Name Disguise** | Window title: `"Microsoft Edge WebView2 Helper"` |
| **Clipboard Stealth** | Uses hidden textarea + `execCommand('copy')` instead of `navigator.clipboard` to avoid permission dialogs |
| **Toggle Visibility** | `Alt+Z` global hotkey instantly hides/shows the window |
| **Emergency Kill** | `Ctrl+Alt+K` terminates the entire process immediately |
| **Snip Tool Stealth** | The snipping overlay also applies `WDA_EXCLUDEFROMCAPTURE` to itself |

---

## Window Management

- **Frameless & Transparent:** No title bar, no borders. HTML/CSS defines the entire visual appearance.
- **Always on Top:** `on_top=True` in PyWebView config.
- **Draggable Regions:** Elements with CSS class `pywebview-drag-region` allow window dragging (TopBar, ControlBar).
- **Dynamic Resize:** `useWindowSync` hook + `sync_window_size` bridge method → OS window resizes to match React content.
- **Interactivity Toggle:** `mouseEnter` on root div ensures `WS_EX_NOACTIVATE` is removed so the user can interact.

---

## AI Response Schema

The Gemini AI is instructed to output JSON matching this schema:

```json
{
  "blocks": [
    {
      "type": "text|code|strategy|problem|analysis|interview|step|option",
      "content": "string",
      "lang": "string|null",
      "label": "string|null",
      "time": "string|null",
      "space": "string|null"
    }
  ],
  "summary": "string",
  "time_complexity": "string|null",
  "space_complexity": "string|null"
}
```

### Dual-Destination Routing
- **`text` blocks** → Chat Panel (conversational responses)
- **All other blocks** → Response Panel (technical content)

---

## Block Types & Rendering

| Type | Component | Purpose | Visual Style |
|------|-----------|---------|-------------|
| `text` | TextBlock | Conversational AI voice | Gray text, markdown formatting |
| `code` | CodeBlock | Code solution | Syntax-highlighted, collapsible, copy button |
| `problem` | ProblemBlock | Problem explanation | 📝 header, collapsible |
| `strategy` | StrategyBlock | Approach/algorithm | 🎯 header, italic, collapsible |
| `interview` | InterviewBlock | Answer script to read aloud | ⭐ header, large text (18px), bold keyword highlighting |
| `step` | StepsBlock | Implementation steps | Numbered circles, blue accent, grouped |
| `analysis` | AnalysisBlock | Time/space complexity | Metrics display, collapsible |
| `option` | OptionBlock | MCQ answer | ⭐ header, label in amber brackets |

---

## User Guide

### Starting the Application

1. **Start the frontend dev server:**
   ```bash
   cd desktop-app/frontend
   npm run dev     # Starts Vite on port 5174
   ```

2. **Start the backend:**
   ```bash
   cd desktop-app/backend
   python main.py  # Launches the overlay window
   ```

3. **Select a mode:**
   - **Assessment:** For coding problems, MCQs, or video-based questions
   - **Interview:** For grounded answers using your resume + JD context

### During Use

| Action | How |
|--------|-----|
| **Capture a region** | Click `Capture` → draw a rectangle on screen |
| **Analyse full screen** | Click `Analyse Screen` — captures and sends to AI immediately |
| **Analyse existing capture** | Click `Analyse Snippet` — uses the last capture |
| **Process capture** | Click `Process` — captures screen and sends to AI |
| **Ask a follow-up** | Open Chat panel → type in the textarea → Enter |
| **Stop AI generation** | Click `Stop` (ControlBar for response, send button for chat) |
| **Clear everything** | Click `Clear` — removes captures, resets panels |
| **Navigate response history** | Use `◀ 1/3 ▶` arrows in the Response Panel header |
| **Sort response blocks** | Click the sort icon (↕) in the Response Panel header |
| **Toggle chat panel** | Click `Chat` / `Hide` in the ControlBar |
| **Collapse panels** | Click the `▼` chevron in TopBar or ControlBar |
| **Hide the overlay** | Click `Hide` or press `Alt+Z` |
| **Show the overlay** | Press `Alt+Z` again |
| **Quit** | Click `Quit` or press `Ctrl+Alt+K` |
| **Start listening (Interview)** | Click `Listen` — starts mic capture |

### Interview Mode Workflow
1. Select "Interview" mode
2. Paste your **Job Description** and **Resume** in the Persona Calibration screen
3. Click "Start Interview Session"
4. Click "Listen" to start microphone capture
5. As the interviewer speaks, the transcript ticker shows live text
6. After ~40 seconds of silence (with sufficient text), the AI auto-analyzes
7. The interview script (⭐ Answer Script) appears in the Response Panel — read it aloud

---

## File Index

### Backend (`desktop-app/backend/`)

| File | Purpose |
|------|---------|
| `main.py` | Application entry point, window creation, hotkeys |
| `core/config.py` | Central configuration (env, paths, API keys) |
| `core/logger.py` | Singleton logger setup |
| `core/decorators.py` | `@bridge_safe`, `@latency_timer` decorators |
| `bridge/router.py` | API router — all methods exposed to frontend |
| `services/ai_service.py` | Gemini AI client, streaming, key rotation |
| `services/vision_service.py` | Screen capture, OCR, image preprocessing |
| `services/window_service.py` | Win32 window manipulation (stealth, ghost, focus) |
| `services/audio_service.py` | Audio engine lazy wrapper |
| `services/prompt_service.py` | System instruction + prompt construction |
| `src/engine/audio.py` | Low-level audio sidecar socket manager |
| `src/snapper_win.py` | PyQt6 interactive screen snipping tool |
| `windows_engine.py` | Legacy monolithic engine (superseded) |
| `audio_service.py` | Audio sidecar subprocess entry point |
| `requirements.txt` | Python dependencies |

### Frontend (`desktop-app/frontend/src/`)

| File | Purpose |
|------|---------|
| `main.jsx` | React root |
| `App.jsx` | Top-level router (ModeSelection → ContextSetup → MainLayout) |
| `index.css` | Global Tailwind styles + scrollbar utilities |
| `api/bridge.js` | Centralized PyWebView bridge API wrapper |
| `store/useAppStore.js` | Zustand store (mode, showChat, showResponse) |
| **Layouts** | |
| `layout/ModeSelection.jsx` | Mode selection screen |
| `layout/ContextSetup.jsx` | Resume + JD input screen (Interview mode) |
| `layout/MainLayout.jsx` | Main operational interface + all handlers |
| `layout/ResponsePanel.jsx` | AI analysis response display |
| `layout/ChatPanel.jsx` | Chat panel wrapper |
| **Components** | |
| `components/ChatWindow.jsx` | Chat message list + input |
| `components/CodeBlock.jsx` | Syntax-highlighted code with copy |
| `components/TextBlock.jsx` | Formatted text with markdown |
| `components/ProblemBlock.jsx` | Problem explanation block |
| `components/StrategyBlock.jsx` | Strategy block |
| `components/InterviewBlock.jsx` | Interview answer script |
| `components/AnalysisBlock.jsx` | Time/space complexity metrics |
| `components/StepsBlock.jsx` | Implementation steps |
| `components/OptionBlock.jsx` | MCQ answer option |
| `components/Button.jsx` | Reusable button with variants |
| `components/ui/TopBar.jsx` | Top navigation bar |
| `components/ui/ControlBar.jsx` | Action buttons bar |
| `components/ui/WindowBar.jsx` | Minimal title bar for setup screens |
| `components/ui/Select.jsx` | Custom dropdown |
| **Hooks** | |
| `hooks/useAIStream.js` | AI streaming management |
| `hooks/useAudioIO.js` | Audio transcription + silence detection |
| `hooks/useWindowSync.js` | OS window resize sync (MainLayout) |
| **Utilities** | |
| `utils/blockRenderer.jsx` | Block type → component mapping |
| `utils/streamParser.js` | Partial JSON stream parser |
| `utils/useTypedStream.js` | Typing effect animation |
| `utils/useWindowResizeSync.js` | OS window resize sync (setup screens) |
| `utils/constants.js` | Mock data for development |
