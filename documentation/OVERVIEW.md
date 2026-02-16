# ShadowLith 🌌
> **The Stealth Intelligence Layer for Ubuntu**

ShadowLith is a lightweight, invisible-to-recording system assistant designed for deep technical sessions and high-stakes assessments. It bridges the gap between your screen and Gemini Pro through local OCR, regional snipping, and persistent stateful memory. Now supporting both **Ubuntu (X11)** and **Windows 11**.

---

## 🎯 Core Idea

The philosophy of ShadowLith is **"Intelligence without Interference."** 

It operates as a background system service that monitors specific regions of your screen only when triggered, converting visual data into text locally before engaging a long-term AI conversation. It is designed to be undetectable by screen-sharing software (Google Meet/Zoom) and browser-based proctoring tools (HackerRank/Mettle).

---

## 🛠 Feature Breakdown

### 1. The "Ghost" Frontend (React + pywebview)
- **The Idea:** A UI that exists for you but doesn't exist for the OS.
- **What it does:** Uses X11 "Bypass" flags and "No-Focus" attributes to render a transparent control center.
- **Why:** It allows you to interact with the assistant without "Tabbing Out" of your browser, preventing proctoring flags.

### 2. Regional "Rubber Band" Snapper
- **The Idea:** Precision over volume.
- **What it does:** Instead of capturing the whole screen, users drag a selection box over a specific MCQ or code block.
- **Why:** Increases OCR accuracy by 90% and keeps the AI focused on the relevant problem, saving on token costs and improving response speed.

### 3. Multi-Capture Text Buffer
- **The Idea:** Accumulating context before execution.
- **What it does:** Allows users to "snip" multiple parts of a long question (e.g., a diagram in snip 1 and the options in snip 2). The text is extracted and held in a local buffer.
- **Why:** Solves the problem of long, scrolling questions that don't fit in one view.

### 4. Persistent "Same Chat" Engine
- **The Idea:** 2-hour stateful memory.
- **What it does:** Uses the Gemini `start_chat()` API to maintain one continuous conversation.
- **Why:** Gemini remembers previous snippets. If Question 1 defines a variable and Question 10 asks about its value, ShadowLith doesn't need to be re-told the context.

### 5. Split-Pane Display Panel
- **The Idea:** Optimized cognitive load.
- **What it does:** Automatically splits the answer into two sections:
    - **Answer Section:** Pure code or the specific MCQ option.
    - **Explanation Section:** Simple English reasoning for the "why" behind the answer.
- **Why:** Allows for rapid "glance-and-act" during timed tests.

---

## 🔄 The Workflow

1. **Launch**
   - **Ubuntu:** Start the `shadowlith.service`.
   - **Windows:** Run `python main.py` (ensure dependencies are installed via `requirements.txt`).
   - The "Pill" (Control Center) appears on your screen.

2. **Capture**
   - Click **Capture** (or use global hotkey).
   - The UI hides, screen dims, and you "snip" the question.
   - **Ubuntu:** Tesseract OCR extracts the text.
   - **Windows:** Native `Windows.Media.Ocr` extracts the text.

3. **Accumulate**
   - *(Optional)* Repeat the capture for diagrams or extra options.

4. **Process**
   - Click **Answer**.
   - ShadowLith joins the buffer text with a predefined "Master Prompt."
   - The prompt is sent to the Persistent Gemini Session.

5. **Render**
   - Gemini returns a structured response.
   - The **Display Panel** slides out, showing the code and explanation in their respective slots.

6. **Next**
   - Move to the next question.
   - The context remains in Gemini's memory until you hit **Reset**.

---


## 💻 Dual Engine Architecture

ShadowLith now operates with a backend that selects the appropriate "Engine" based on the host OS:

### Linux Engine (Legacy)
- **OCR:** `pytesseract` (Tesseract 5) wrapper.
- **Snapper:** `mss` based capture with `PyQt6` overlay.
- **Stealth:** `xprop` atom injection for `_NET_WM_STATE_SKIP_TASKBAR`.
- **Renderer:** `Qt` webview engine.

### Windows Engine (New)
- **OCR:** Native `Windows.Media.Ocr` (Offline, GPU-accelerated).
- **Snapper:** `Pillow` (`ImageGrab`) based capture with DPI-aware `PyQt6` overlay.
- **Stealth:** `SetWindowDisplayAffinity` with `WDA_EXCLUDEFROMCAPTURE`.
- **Ghost Mode:** `WS_EX_TRANSPARENT` & `WS_EX_LAYERED` for click-through.
- **Renderer:** `EdgeChromium` (WebView2) engine.

## 🥷 Stealth Specification

| Component | Specification (Linux) | Specification (Windows) | Description |
| :--- | :--- | :--- | :--- |
| **Display Server** | X11 | DWM / Win32 | OS specific window management. |
| **Window Manager** | GNOME | Windows 11 | Optimized for modern desktop environments. |
| **Stealth Flag** | `_NET_WM_WINDOW_TYPE_DOCK` | `WDA_EXCLUDEFROMCAPTURE` | Makes the window invisible to capture tools. |
| **Click-Through** | `WindowTransparentForInput` | `WS_EX_TRANSPARENT` | Allows interacting with the window behind ShadowLith. |