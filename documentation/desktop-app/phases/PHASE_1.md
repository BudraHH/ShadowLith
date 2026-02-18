# Phase 1: The Core Intelligence Engine

> This phase focuses on the **"Brain"** and **"Eyes"** of ShadowLith. We will establish the persistent connection to Gemini Pro and build the local OCR pipeline to handle multiple screen captures.

---

## 1.1 Development Environment Setup
First, initialize your project in **Anti-Gravity IDE** by setting up the Python environment and installing the necessary drivers for Ubuntu.

### System Requirements (Ubuntu)
Open your terminal and install the Tesseract OCR engine:

```bash
sudo apt update
sudo apt install tesseract-ocr libtesseract-dev
```

### Python Environment
Install the core libraries:

```bash
pip install google-generativeai pytesseract mss Pillow python-dotenv
```

---

## 1.2 Persistent Chat Logic (`engine.py`)
The **"Same Chat"** requirement is achieved by initializing a `ChatSession` object once. This object lives in the system memory for the duration of your 2-hour session.

### The Intelligence Code
Create a file named `engine.py`. This script manages the API connection and maintains the conversation state.

```python
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class NyxEngine:
    def __init__(self):
        # Configure Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Start the persistent session
        # This history stays empty at start but grows as you ask questions
        self.chat = self.model.start_chat(history=[])
        
        # The Master Instruction (Predefined Prompt)
        self.system_prompt = (
            "You are ShadowLith, a technical assistant. "
            "If the input is an MCQ, provide the correct option and a brief explanation. "
            "If it is code, provide the solution and logic separately."
        )

    def ask(self, buffered_text):
        full_query = f"{self.system_prompt}\n\nUSER INPUT:\n{buffered_text}"
        response = self.chat.send_message(full_query)
        return response.text
```

---

## 1.3 Local OCR & Buffering Logic
This part handles the **"Eyes."** It takes the raw screenshot from the regional snip, extracts text using Tesseract, and adds it to an internal list.

### The Processing Logic
Add this to your `engine.py` or a new `ocr_handler.py`.

```python
import pytesseract
from PIL import Image

class TextBuffer:
    def __init__(self):
        self.parts = []

    def add_snip(self, image_path):
        # Local OCR processing
        text = pytesseract.image_to_string(Image.open(image_path))
        if text.strip():
            self.parts.append(text.strip())
            return True
        return False

    def get_full_text(self):
        # Join multiple snips with a separator for Gemini to understand
        return "\n--- NEW SECTION ---\n".join(self.parts)

    def clear(self):
        self.parts = []
```

---

## 1.4 Workflow Integration (Phase 1 Test)
To test if your **"Brain"** and **"Eyes"** are working together in your IDE terminal:

1.  **Capture:** Manually take a small screenshot of a question.
2.  **OCR:** Run `buffer.add_snip('path/to/image.png')`.
3.  **Chat:** Run `engine.ask(buffer.get_full_text())`.
4.  **Persistence Check:** Ask a second question related to the first to ensure Gemini remembers the context.

### Why this works for your 2-hour limit:
Because `NyxEngine` is initialized once when you start the service, the `self.chat` object maintains its internal history list. Every time you call `send_message`, the new text is appended to that history, satisfying your **"Same Chat"** requirement perfectly.