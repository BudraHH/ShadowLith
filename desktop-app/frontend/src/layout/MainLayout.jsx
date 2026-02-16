/**
 * MainLayout.jsx
 * The outermost HUD shell. Everything renders inside this.
 * It provides the dark glassmorphism container with rounded borders.
 */

import Button from "../components/Button"
import TextBlock from "../components/TextBlock"
import CodeBlock from "../components/CodeBlock"
import AnalysisBlock from "../components/AnalysisBlock"
import ProblemBlock from "../components/ProblemBlock"
import StrategyBlock from "../components/StrategyBlock"
import InterviewBlock from "../components/InterviewBlock"
import StepsBlock from "../components/StepsBlock"
import OptionBlock from "../components/OptionBlock"
import Select from "../components/Select"
// ... imports
import React, { useState, useEffect } from "react"
import { ChevronRight, Trash2, Send, Zap, X, GripHorizontal, Loader2, Minimize2, Terminal, MessageSquare, BookOpen, Sparkles, Camera, Mic, MonitorPlay, ChevronLeft, ChevronDown, ChevronUp, Ghost, Activity, Search, History, User } from "lucide-react"

import ExplanationPanel from "./ExplanationPanel"
import SolutionPanel from "./SolutionPanel"
import ChatPanel from "./ChatPanel"

import { MOCK_MCQ_ANSWER, MOCK_MCQ_EXPLANATION, MOCK_HISTORY } from "../utils/constants"
import ModeSelection from "./ModeSelection"

function MainLayout() {
    const [showExplanation, setShowExplanation] = useState(true);
    const [showAnswer, setShowAnswer] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [mode, setMode] = useState(null); // Assessment or Interview
    const [language, setLanguage] = useState("Python");
    const [isInitialized, setIsInitialized] = useState(false);
    const [showSystemButtons, setShowSystemButtons] = useState(false);
    const [isHudMode, setIsHudMode] = useState(false);
    const [isGhostMode, setIsGhostMode] = useState(false);

    // Core State
    const [data, setData] = useState(null);
    const [explanationData, setExplanationData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [captureCount, setCaptureCount] = useState(0);

    // History System
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Chat Persistance
    const [chatMessages, setChatMessages] = useState([
        { role: "assistant", content: [{ type: 'text', content: "Hello!!" }] },
        { role: "assistant", content: [{ type: 'text', content: "I’m here to support you through this assessment/interview. How can I help you right now?" }] }
    ]);

    const navigateHistory = (direction) => {
        const newIndex = historyIndex + direction;
        if (newIndex >= 0 && newIndex < history.length) {
            setHistoryIndex(newIndex);
            const version = history[newIndex];
            setData(version.data);
            setExplanationData(version.explanationData);
        }
    };

    useEffect(() => {
        const checkBuffer = async () => {
            if (window.pywebview) {
                // Initial sync could go here
            }
        };
        checkBuffer();
    }, []);

    const toggleHud = async () => {
        const nextMode = !isHudMode;
        setIsHudMode(nextMode);
        if (window.pywebview) {
            if (nextMode) {
                await window.pywebview.api.resize_window(1200, 62);
            } else {
                await window.pywebview.api.resize_window(1200, 850);
            }
        }
    };

    const toggleGhost = async () => {
        const nextMode = !isGhostMode;
        setIsGhostMode(nextMode);
        if (window.pywebview) {
            await window.pywebview.api.set_ghost_mode(nextMode);
        }
    };

    const renderBlocks = (blocks) => {
        if (!blocks || !Array.isArray(blocks)) return null;

        return blocks.map((block, idx) => {
            switch (block.type) {
                case 'text':
                    return <TextBlock key={idx}>{block.content}</TextBlock>;
                case 'code':
                    return <CodeBlock key={idx} code={block.content} lang={block.lang || 'javascript'} />;
                case 'option':
                    return <OptionBlock key={idx} label={block.label} content={block.content} />;
                case 'analysis':
                    return (
                        <AnalysisBlock
                            key={idx}
                            time={block.time}
                            space={block.space}
                            complexityLabel={block.label}
                        />
                    );
                case 'interview':
                    if (mode === 'Assessment') return null;
                    return <InterviewBlock key={idx} content={block.content} />;
                case 'problem':
                    return <ProblemBlock key={idx} content={block.content} />;
                case 'strategy':
                    return <StrategyBlock key={idx} content={block.content} />;
                case 'step':
                    if (idx > 0 && blocks[idx - 1].type === 'step') return null;
                    const stepGroup = [];
                    let currentIdx = idx;
                    while (currentIdx < blocks.length && blocks[currentIdx].type === 'step') {
                        stepGroup.push(blocks[currentIdx]);
                        currentIdx++;
                    }
                    return <StepsBlock key={idx} steps={stepGroup} />;
                default:
                    return null;
            }
        });
    };

    const renderHeaderBadges = (item) => {
        if (!item) return null;
        return (
            <div className="flex flex-wrap gap-2 mb-4">
                {item.summary && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-wider">
                        {item.summary}
                    </span>
                )}
            </div>
        );
    };

    const handleCapture = async () => {
        if (!window.pywebview) return;
        try {
            const res = await window.pywebview.api.capture();
            if (res.status === 'success') setCaptureCount(res.count);
        } catch (e) {
            console.error(e);
        }
    };

    const handleProcess = async () => {
        if (!window.pywebview) return;
        setIsProcessing(true);
        setData(null);
        setExplanationData(null); // Clear both during processing

        try {
            const rawResponse = await window.pywebview.api.get_answer(mode, language);
            try {
                let parsed = JSON.parse(rawResponse);
                if (typeof parsed === 'string') {
                    const cleaned = parsed.replace(/```json/g, '').replace(/```/g, '').trim();
                    parsed = JSON.parse(cleaned);
                }

                // SPLIT LOGIC: Send blocks to correct panels
                const explanationTypes = ['problem', 'strategy', 'interview'];
                const solutionTypes = ['code', 'step', 'option', 'analysis', 'text', 'warning'];

                const explanationBlocks = parsed.blocks?.filter(b => explanationTypes.includes(b.type)) || [];
                const solutionBlocks = parsed.blocks?.filter(b => solutionTypes.includes(b.type)) || [];

                const newExpl = {
                    ...parsed,
                    blocks: explanationBlocks
                };
                const newSol = {
                    ...parsed,
                    blocks: solutionBlocks
                };

                setExplanationData(newExpl);
                setData(newSol);

                // Update History
                setHistory(prev => {
                    const updated = [...prev, { explanationData: newExpl, data: newSol }];
                    setHistoryIndex(updated.length - 1);
                    return updated;
                });

                // Clear Buffer Logic (Backend & Frontend)
                await window.pywebview.api.revoke_snip();
                setCaptureCount(0);

            } catch (jsonError) {
                setData({ explanation: rawResponse, code: null });
            }
        } catch (e) {
            setData({ explanation: `Error: ${e}` });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = async () => {
        if (window.pywebview) await window.pywebview.api.revoke_snip();
        setCaptureCount(0);
        setData(null);
        setExplanationData(null);
        setHistory([]);
        setHistoryIndex(-1);
    };

    const handleHide = async () => {
        if (window.pywebview) await window.pywebview.api.hide_ui();
    };

    // --- RESIZE OBSERVER LOGIC ---
    // This effect watches the root container's size and syncs it with the OS window
    useEffect(() => {
        if (!window.pywebview) return;

        const syncSize = () => {
            const container = document.getElementById('main-layout-container');
            if (container) {
                // Get the full scroll width/height of the layout
                const width = container.scrollWidth;
                const height = container.scrollHeight;

                // Add a small buffer to prevent scrollbars or clipping
                window.pywebview.api.sync_window_size(width + 2, 800);
            }
        };

        // Create observer
        const observer = new ResizeObserver(() => {
            // Debounce slightly or use requestAnimationFrame if needed, 
            // but direct call is usually fine for this scale
            requestAnimationFrame(syncSize);
        });

        const target = document.getElementById('main-layout-container');
        if (target) {
            observer.observe(target);
        }

        return () => observer.disconnect();
    }, [showExplanation, showAnswer, showChat, showHistory, isHudMode, mode]); // Re-bind on layout changes

    if (!isInitialized) {
        return <ModeSelection onSelect={(m) => { setMode(m); setIsInitialized(true); }} />
    }

    const noPanel = !showAnswer && !showExplanation && !showChat;
    const onlyOnePanel = (showAnswer && !showExplanation && !showChat) || (!showAnswer && showExplanation && !showChat) || (!showAnswer && !showExplanation && showChat);
    const atleastTwoPanel = (showAnswer && showExplanation) || (showAnswer && showChat) || (showExplanation && showChat);

    return (
        <div id="main-layout-container" className="relative flex flex-col gap-2 h-screen bg-transparent overflow-hidden relative w-max">


            {/* --- TOP CONTROL BAR --- */}
            <div className="pywebview-drag-region flex flex-row justify-between items-center p-2 w-full bg-[#030303] border border-zinc-800 rounded-md select-none hover:border-zinc-700/50 transition-colors shrink-0 cursor-default z-50 relative pointer-events-auto">
                <div className="flex items-center gap-3 pl-2 pointer-events-none">
                    <h1 className="text-sm font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                        SHADOWLITH
                    </h1>
                    {captureCount > 0 && (
                        <span className="bg-blue-900/50 text-blue-200 text-[10px] px-2 py-0.5 rounded-md border border-blue-500/20">
                            {captureCount} {captureCount > 1 ? 'Snippets' : 'Snippet'} {atleastTwoPanel && 'in Buffer'}
                        </span>
                    )}

                    {/* History Navigation */}
                    {mode !== 'Interview' && history.length > 1 && (
                        <div className="flex items-center gap-2 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-700/50 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => navigateHistory(-1)}
                                disabled={historyIndex <= 0}
                                className={`p-0.5 transition-colors ${historyIndex <= 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-zinc-100'}`}
                            >
                                <ChevronLeft size={12} />
                            </button>
                            <span className="text-[10px] font-mono text-zinc-500 select-none">
                                v{historyIndex + 1}/{history.length}
                            </span>
                            <button
                                onClick={() => navigateHistory(1)}
                                disabled={historyIndex >= history.length - 1}
                                className={`p-0.5 transition-colors ${historyIndex >= history.length - 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-zinc-100'}`}
                            >
                                <ChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-row items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
                    {/* Mode Selector */}
                    <div className="flex items-center bg-zinc-950/50 border border-zinc-800 rounded-md p-0.5">
                        {["Assessment", "Interview"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-2 py-1 text-[10px] rounded-[4px] transition-all duration-200 ${mode === m
                                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* Custom Select (ShadeCN Style) */}
                    <Select
                        value={language}
                        onChange={setLanguage}
                        options={["Python", "Java", "C++", "JavaScript", "Go", "Rust", "SQL"]}
                        placeholder="Select"
                    />



                    {showSystemButtons && (
                        <div className="flex items-center gap-0.5">
                            {(!noPanel || !onlyOnePanel) && <Button variant="ghost" onClick={handleClear} className="flex items-center text-zinc-400 hover:text-red-400 gap-1.5">Abort</Button>}
                            <Button variant="ghost" onClick={handleHide} className="flex items-center text-zinc-400 hover:text-zinc-100 gap-1.5 px-2">Hide</Button>
                            <Button variant="ghost" onClick={async () => window.pywebview && window.pywebview.api.terminate_app()} className="flex items-center text-zinc-500 hover:text-red-500 gap-1.5 px-2">Quit</Button>
                        </div>
                    )}

                    <div onClick={() => setShowSystemButtons(!showSystemButtons)} className="group flex items-center justify-center p-2 rounded-md bg-transparent hover:bg-zinc-800/50 cursor-pointer pointer-events-auto transition-colors duration-200">
                        <ChevronLeft size={14} className={`transition-all duration-300 transform ${showSystemButtons ? "text-zinc-500 rotate-180" : "text-zinc-400 rotate-0"} group-hover:text-white group-hover:scale-110`} />
                    </div>
                </div>
            </div>

            {/* CONTROL BAR */}
            <div className="pywebview-drag-region flex flex-row justify-between items-center p-2 w-full bg-[#030303] border border-zinc-800 rounded-md select-none hover:border-zinc-700/50 transition-colors shrink-0 cursor-default z-40 relative pointer-events-auto">
                <div className="flex flex-row items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                    <Button variant="ghost" onClick={handleCapture} className="flex items-center text-zinc-400 hover:text-zinc-100 gap-1.5 px-2">
                        <Camera size={14} className="text-zinc-500" /> Capture
                    </Button>
                    <Button disabled variant="ghost" className="flex items-center text-zinc-400 hover:text-blue-400 gap-1.5 px-2">
                        <Mic size={14} className="text-zinc-500" /> Listen
                    </Button>
                    <Button disabled variant="ghost" className="flex items-center text-zinc-400 hover:text-purple-400 gap-1.5 px-2">
                        <MonitorPlay size={14} className="text-zinc-500" /> Analyse {atleastTwoPanel && 'Panel'}
                    </Button>
                    <Button variant="ghost" onClick={handleClear} className="flex items-center text-zinc-400 hover:text-yellow-400 gap-1.5 px-2">
                        <Trash2 size={14} className="text-zinc-500" /> Clear
                    </Button>
                    {mode !== 'Interview' && (
                        <Button variant="ghost" onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-1.5 px-2 transition-all ${showHistory ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-400 hover:text-blue-400'}`}>
                            <History size={14} className={showHistory ? "text-blue-400" : "text-zinc-500"} /> History
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleProcess} disabled={isProcessing || captureCount === 0} className={`flex items-center gap-1.5 px-2 ${isProcessing ? 'text-zinc-600' : 'text-zinc-400 hover:text-emerald-400'}`}>
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="text-zinc-500" />}
                        {isProcessing ? 'Thinking...' : 'Process'}
                    </Button>
                </div>
            </div>

            {/* --- HISTORY TIMELINE --- */}
            {mode !== 'Interview' && showHistory && history.length > 0 && (
                <div className="flex flex-row justify-start items-center p-2 w-full bg-[#030303] border border-zinc-800 rounded-md select-none hover:border-zinc-700/50 transition-colors shrink-0 cursor-default z-40 relative pointer-events-auto">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 border-r border-zinc-800 mr-2">Version History</span>
                    <div className="flex flex-row gap-1.5 overflow-x-auto no-scrollbar items-center">
                        {(() => {
                            let pCounter = 0;
                            let lastSummary = null;
                            let vCounter = 0;

                            return history.map((item, idx) => {
                                const summary = item.data?.summary || item.explanationData?.summary || "Analysis";
                                let isNewGroup = false;

                                if (summary !== lastSummary) {
                                    pCounter++;
                                    vCounter = 1;
                                    lastSummary = summary;
                                    isNewGroup = true;
                                } else {
                                    vCounter++;
                                }

                                const label = `P${pCounter}`;
                                const version = `v${vCounter}`;

                                return (
                                    <React.Fragment key={idx}>
                                        {isNewGroup && idx > 0 && <div className="w-px h-6 bg-zinc-800 mx-1 shrink-0"></div>}
                                        <button
                                            onClick={() => {
                                                setHistoryIndex(idx);
                                                setData(item.data);
                                                setExplanationData(item.explanationData);
                                            }}
                                            className={`flex flex-col items-start justify-center px-3 py-1 rounded-md text-xs font-mono transition-all shrink-0 border h-full min-w-[100px] ${historyIndex === idx
                                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                                : 'bg-zinc-800/30 border-zinc-700/30 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between w-full gap-2">
                                                <span className={`text-[10px] font-bold ${historyIndex === idx ? "text-blue-400" : "text-zinc-600"}`}>
                                                    {label} <span className="opacity-50 font-normal">. {version}</span>
                                                </span>
                                                {isNewGroup && <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></span>}
                                            </div>
                                            <span className="max-w-[120px] truncate opacity-70 text-[10px] leading-tight">
                                                {summary}
                                            </span>
                                        </button>
                                    </React.Fragment>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <div className={`flex flex-row flex-1 gap-2 text-sm min-h-0 opacity-98 transition-opacity duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''} z-0 relative`}>
                <ExplanationPanel
                    showExplanation={showExplanation}
                    setShowExplanation={setShowExplanation}
                    showAnswer={showAnswer}
                    showChat={showChat}
                    explanationData={explanationData}
                    renderBlocks={renderBlocks}
                    renderHeaderBadges={renderHeaderBadges}
                    isProcessing={isProcessing}
                />

                <SolutionPanel
                    showAnswer={showAnswer}
                    setShowAnswer={setShowAnswer}
                    showExplanation={showExplanation}
                    showChat={showChat}
                    data={data}
                    renderBlocks={renderBlocks}
                    renderHeaderBadges={renderHeaderBadges}
                    isProcessing={isProcessing}
                />

                <ChatPanel
                    showChat={showChat}
                    setShowChat={setShowChat}
                    showExplanation={showExplanation}
                    showAnswer={showAnswer}
                    messages={chatMessages}
                    setMessages={setChatMessages}
                />
            </div>
        </div>
    );
}

export default MainLayout;
