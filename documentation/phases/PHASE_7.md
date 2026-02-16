# Phase 7: The Showcase & Documentation (React + Vite)

> In this phase, we build the public "face" of ShadowLith. A premium, high-tech landing page and documentation hub that explains the tool, guides installation, and allows users to download the latest release.

---

## 6.1 The Landing Page Strategy
The goal is to sell the "stealth" capability instantly. The design should be dark, futuristic, and clean.

### Key Sections:
1.  **Hero Section:** 
    - **Headline:** "Intelligence without Interference."
    - **Sub-headline:** "The undetectable AI assistant for Linux. Stay focused, stay hidden."
    - **Primary CTA:** "Download for Ubuntu / Windows (v1.0)"
    - **Visual:** An animated GIF showing the `Alt+Space` -> Snip -> Answer flow.

2.  **Feature Grid:**
    - "Invisible to Screen Share" (Icon: Eye with slash)
    - "Local OCR Engine" (Icon: Processing chip)
    - "Gemini Persistent Memory" (Icon: Brain/Network)
    - "Global Hotkey Toggle" (Icon: Keyboard)

3.  **The "How It Works" Section:**
    - Step 1: **Summon (Alt+Space)**
    - Step 2: **Snip (Capture)**
    - Step 3: **Solve (Receive Answer)**
    - Step 4: **Vanish (Auto-Hide)**

---

## 6.2 Implementation Details

### Tech Stack:
- **Framework:** `React.js` (Vite)
- **Styling:** `Tailwind CSS` (Dark Mode default)
- **Animation:** `Framer Motion` (Start small, add complexity later)
- **Icons:** `Lucide React`
- **Routing:** `React Router` (for /docs vs /home)

### Directory Structure:
```
shadowlith-website/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Docs.jsx
│   │   ├── Installation.jsx
│   ├── App.jsx
│   ├── main.jsx
```

---

## 6.3 Technical Documentation ("Docs")
This section is crucial because ShadowLith requires system dependencies.

### Content Strategy:
1.  **Prerequisites:**
    - **Ubuntu:** "Ensure you are on Ubuntu 20.04+ (X11 recommended)."
    - **Ubuntu:** "Install system packages: `sudo apt install tesseract-ocr xdotool libx11-dev`"
    - **Windows:** "Windows 10/11 (Build 19041+ recommended)."
    - **Windows:** "Python 3.10+ installed and added to PATH."

2.  **Configuration:**
    - "Select OS: Ubuntu / Windows."
    - "How to get a Gemini API Key (Free)."
    - "Creating the `.env` file."

3.  **Troubleshooting:**
    - "Window not hiding? Check if you are on Wayland."
    - "Hotkeys not working? Ensure `pynput` permissions."

---

## 6.4 Distribution
How do users actually get the app?

    - **Windows:** `pip install -r requirements.txt`
    - **Linux:** Run `install.sh` (or `pip install -r requirements.txt`)

2.  **Manual Download:**
    - Link to the GitHub Releases page for zip/tar.gz downloads.
