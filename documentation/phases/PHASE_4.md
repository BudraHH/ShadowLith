# Phase 4: The "Control Center" & "Display" (React)

> In this phase, we build the Interactive Dashboard. We shift from the Python backend to the React frontend, using Vite for a fast development experience. This UI is where the magic happens—where raw text turns into structured, syntax-highlighted solutions.

---

## 4.1 The Split-Pane Architecture
To satisfy your requirement for a "two-part" UI, we use a flexible layout that separates **Actions** (Control Center) from **Answers** (Display Panel).

### The UI Blueprint
- **Left Sidebar (Control Center)**: A fixed-width vertical bar containing your 4 core buttons: **Capture**, **Listen**, **Revoke**, and **Send**.
- **Right Panel (Display Area)**: A dynamic space that changes based on whether you are solving an MCQ or a Coding problem.

---

## 4.2 Building the Components

### 1. The Sidebar (Control Center)
The sidebar now hosts **5 Strategic Actions** to manage your stealth session.

```javascript
// Sidebar.jsx
export const Sidebar = ({ onCapture, onSend, onRevoke, onReset, onAbort }) => (
  <div className="w-16 h-full bg-black/90 flex flex-col items-center py-4 space-y-4 border-r border-white/10 backdrop-blur-md">
    
    {/* 1. Capture: Snip screen */ }
    <button onClick={onCapture} title="Capture Region" 
      className="p-3 hover:bg-blue-500/20 text-blue-400 rounded-xl transition">📸</button>
    
    {/* 2. Revoke: Undo last snip (bad crop) */ }
    <button onClick={onRevoke} title="Revoke Buffer" 
      className="p-3 hover:bg-yellow-500/20 text-yellow-500 rounded-xl transition">⏮️</button>

    {/* 3. Reset: New Session (Wipe Memory) */ }
    <button onClick={onReset} title="Hard Reset Session"
      className="p-3 hover:bg-purple-500/20 text-purple-400 rounded-xl transition">🔄</button>

    <div className="mt-auto space-y-4 w-full flex flex-col items-center">
        {/* 4. Abort: Cancel + Hide UI + Clear Buffer */ }
        <button onClick={onAbort} title="Abort & Hide"
          className="p-3 hover:bg-red-500/20 text-red-500 rounded-xl transition">🛑</button>

        {/* 5. Send: Get Answer & Auto-Hide */ }
        <button onClick={onSend} title="Ask Gemini"
          className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/50">🚀</button>
    </div>
  </div>
);
```

### 2. The Smart Display Panel
We use `react-syntax-highlighter` to render the code and `react-markdown` for the explanation logic.

```javascript
// DisplayPanel.jsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const DisplayPanel = ({ data }) => {
  const isCoding = !!data.code;

  return (
    <div className="flex-1 p-6 overflow-y-auto text-white">
      {isCoding ? (
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-1 bg-zinc-900 rounded-lg p-2 border border-white/5">
            <h3 className="text-xs font-bold text-blue-400 mb-2 uppercase">Answer Section (Code)</h3>
            <SyntaxHighlighter language="python" style={vscDarkPlus}>
              {data.code}
            </SyntaxHighlighter>
          </div>
          <div className="h-1/3 bg-zinc-800/50 rounded-lg p-4 italic text-sm">
             <h3 className="text-xs font-bold text-green-400 mb-2 uppercase">Explanation Section</h3>
             {data.explanation}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-500 mb-4">{data.option}</h1>
          <p className="text-lg leading-relaxed text-zinc-300">{data.explanation}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 4.3 Structured Data Handling
To make this work perfectly, we need Gemini to return data in a specific format. In Phase 1, we will update the System Prompt to ask for JSON.

### The "Logic" Strategy
You will tell Gemini: *"Return only JSON with keys: 'type' (mcq/code), 'option', 'code', 'explanation'."*

### Frontend Receiver

```javascript
const handleSend = async () => {
  setLoading(true);
  const rawResponse = await window.pywebview.api.get_answer();
  try {
    const parsed = JSON.parse(rawResponse);
    setResult(parsed);
  } catch (e) {
    setResult({ explanation: rawResponse }); // Fallback if not JSON
  }
  setLoading(false);
};
```

### Why Phase 4 is the "Killer Feature"
By using React, you’ve turned a simple terminal script into a high-end developer tool. The **syntax highlighting** ensures you can read the code at a glance, and the **"Explanation"** section allows you to understand the logic without ever taking your eyes off the screen.