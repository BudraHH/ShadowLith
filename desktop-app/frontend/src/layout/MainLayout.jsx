/**
 * MainLayout.jsx
 * The outermost HUD shell. Everything renders inside this.
 * It provides the dark glassmorphism container with rounded borders.
 */

import Button from "../components/Button"
import TextBlock from "../components/TextBlock"
import CodeBlock from "../components/CodeBlock"
import { useState, useEffect } from "react"
import { ChevronRight, Trash2, Send, Zap, X, GripHorizontal, Loader2, Minimize2, Terminal } from "lucide-react"

function MainLayout() {
    const [showExplanation, setShowExplanation] = useState(true);
    const [showAnswer, setShowAnswer] = useState(true);

    // Core State
    const [data, setData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [captureCount, setCaptureCount] = useState(0);

    const renderContent = (contentData) => {
        if (!contentData) return <div className="text-zinc-500 italic p-4">Ready to process...</div>;

        return Object.entries(contentData).map(([key, value]) => {
            if (!value) return null;

            if (key.startsWith('text') || key === 'explanation' || key === 'option') {
                return <TextBlock key={key}>{value}</TextBlock>;
            }

            if (key.startsWith('code')) {
                return <CodeBlock key={key} code={value} />;
            }

            return null;
        });
    };

    // --- API HANDLERS ---

    const handleCapture = async () => {
        if (!window.pywebview) {
            console.error("ShadowLith Backend not connected via pywebview.");
            return;
        }
        try {
            const res = await window.pywebview.api.capture();
            if (res.status === 'success') {
                setCaptureCount(res.count);
            } else {
                console.warn("Capture failed:", res.message);
            }
        } catch (e) {
            console.error("Capture Error:", e);
        }
    };

    const handleProcess = async () => {
        if (!window.pywebview) return;

        setIsProcessing(true);
        setData(null); // Clear previous result while thinking

        try {
            // rawResponse is a JSON string from Python
            const rawResponse = await window.pywebview.api.get_answer();
            try {
                // Robust JSON parsing
                let parsed = JSON.parse(rawResponse);

                // If the response is wrapped in code blocks (common LLM artifact), clean it
                if (typeof parsed === 'string') {
                    const cleaned = parsed.replace(/```json/g, '').replace(/```/g, '').trim();
                    parsed = JSON.parse(cleaned);
                }

                setData(parsed);
            } catch (jsonError) {
                // Fallback if Gemini returns raw text instead of JSON
                console.warn("JSON Parse Failed, falling back to raw text", jsonError);
                setData({
                    explanation: rawResponse,
                    code: null
                });
            }
        } catch (e) {
            console.error("Process Error:", e);
            setData({ explanation: `Error processing request: ${e}` });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = async () => {
        if (window.pywebview) await window.pywebview.api.revoke_snip();
        setCaptureCount(0);
        setData(null);
    };

    const handleHide = async () => {
        if (window.pywebview) await window.pywebview.api.hide_ui();
    };

    return (
        <div className="flex flex-col gap-2 w-screen h-screen bg-transparent p-1 overflow-hidden">

            {/* --- TOP CONTROL BAR --- */}
            <div className="pywebview-drag-region flex flex-row justify-between items-center p-2 w-full bg-zinc-900 border border-zinc-800 rounded-lg select-none hover:border-zinc-700/50 transition-colors shrink-0 cursor-move">
                <div className="flex items-center gap-3 pl-2 pointer-events-none">
                    <GripHorizontal className="text-zinc-600" size={20} />
                    <span className="font-mono font-bold text-sm tracking-tighter uppercase text-zinc-100">ShadowLith // </span>
                    {captureCount > 0 && (
                        <span className="bg-blue-900/50 text-blue-200 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20">
                            {captureCount} Snippet{captureCount > 1 ? 's' : ''} in Buffer
                        </span>
                    )}
                </div>

                <div className="flex flex-row items-center gap-4">
                    <div className="flex gap-2" onMouseDown={(e) => e.stopPropagation()}>
                        <Button variant="" onClick={handleCapture} className="bg-zinc-500/10 text-zinc-300/90 border-zinc-500/20 hover:bg-zinc-500/30 hover:text-zinc-100 text-xs px-3 py-1.5 flex items-center gap-1 ">
                            <Zap size={14} /> Capture
                        </Button>
                        <Button variant="" onClick={handleClear} className="bg-yellow-500/5 text-yellow-400/90 border-yellow-500/20 hover:bg-yellow-500/20 text-xs px-3 py-1.5 flex items-center gap-1">
                            <Trash2 size={14} /> Clear
                        </Button>
                        <Button
                            variant=""
                            onClick={handleProcess}
                            disabled={isProcessing || captureCount === 0}
                            className={`bg-emerald-500/10 text-emerald-400/90 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-100 text-xs px-3 py-1.5 flex items-center gap-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            {isProcessing ? 'Thinking...' : 'Process'}
                        </Button>
                        <Button variant="" onClick={handleHide} className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20 hover:text-zinc-100 text-xs px-3 py-1.5 flex items-center gap-1">
                            <Minimize2 size={14} /> Hide
                        </Button>
                        <Button variant="" onClick={handleClear} className="bg-red-500/20 text-red-400/90 border-red-500/20 hover:bg-red-500/20 hover:text-red-500 text-xs px-3 py-1.5 flex items-center gap-1">
                            <X size={14} /> Abort
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className={`flex flex-row flex-1 w-full gap-2 overflow-hidden text-sm min-h-0 opacity-90 transition-opacity duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* LEFT: EXPLANATION / CONTEXT */}
                <div className={`flex flex-col transition-all duration-300 ${showExplanation ? 'w-1/2' : 'w-12'} bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden min-w-0 `}>
                    <div
                        className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                        onClick={() => setShowExplanation(!showExplanation)}
                    >
                        <div className="flex items-center gap-2 text-zinc-400">
                            <span className="font-bold uppercase tracking-wider text-xs text-zinc-300">{showExplanation ? "Explanation" : "E"}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-zinc-300 transition-transform duration-200 ${showExplanation ? 'rotate-180' : 'rotate-0'}`} />
                    </div>

                    {showExplanation && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar">
                            {/* Render Explanation/Text parts specifically if structured, else all text */}
                            {data ? (
                                <>
                                    {data.option && <TextBlock className="text-xl font-bold text-blue-400 mb-4">{data.option}</TextBlock>}
                                    {data.explanation && <TextBlock>{data.explanation}</TextBlock>}
                                    {/* Fallback for undefined keys that are text */}
                                    {Object.entries(data).map(([k, v]) => k.startsWith('text') ? <TextBlock key={k}>{v}</TextBlock> : null)}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-600">
                                    <div className="text-center">
                                        <p>No Context Loaded</p>
                                        <p className="text-xs opacity-50">Capture a region to begin</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: ANSWER / OUTPUT */}
                <div className={`flex flex-col transition-all duration-300 ${showAnswer ? 'w-1/2' : 'w-12'} bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden min-w-0 `}>
                    <div
                        className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-900 transition-colors"
                        onClick={() => setShowAnswer(!showAnswer)}
                    >
                        <div className="flex items-center gap-2 text-emerald-500">
                            <span className="font-bold uppercase tracking-wider text-xs">{showAnswer ? "Solution" : "S"}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-emerald-300 transition-transform duration-200 ${showAnswer ? 'rotate-180' : 'rotate-0'}`} />
                    </div>

                    {showAnswer && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 thin-scrollbar">
                            {data && data.code ? (
                                <CodeBlock code={data.code} />
                            ) : (
                                data && !data.code && data.explanation ? (
                                    <div className="flex items-center justify-center h-full text-zinc-500 italic">
                                        No code in solution. See explanation.
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-emerald-900/30">
                                        <Terminal size={48} />
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default MainLayout
