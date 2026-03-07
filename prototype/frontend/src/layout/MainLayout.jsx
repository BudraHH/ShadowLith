import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, ChevronDown, Activity, Camera, Zap, Mic, MonitorPlay, Trash2, Send, Loader2, Square, RotateCcw, Eraser } from "lucide-react";

// Components
import TopBar from "../components/ui/TopBar";
import ControlBar from "../components/ui/ControlBar";
import ResponsePanel from "./ResponsePanel";
import ChatPanel from "./ChatPanel";

// Hooks
import { bridge } from "../api/bridge";
import { useAIStream } from "../hooks/useAIStream";
import { useWindowSync } from "../hooks/useWindowSync";
import { useAudioIO } from "../hooks/useAudioIO";
import { useAppStore, setModeAction } from "../store/useAppStore";

// Utils
import { renderBlocks } from "../utils/blockRenderer"; // I will create this next

const ContentArea = ({ data, setData, streamingText, isResponseProcessing, isChatProcessing, history, historyIndex, setHistoryIndex, chatMessages, setChatMessages, onSendMessage, onStop }) => {
    const showChat = useAppStore(state => state.showChat);
    return (
        <div className="flex flex-row gap-1 h-auto max-h-[750px] relative">
            <ResponsePanel
                data={data}
                setData={setData}
                streamingText={streamingText}
                isProcessing={isResponseProcessing}
                history={history}
                historyIndex={historyIndex}
                setHistoryIndex={setHistoryIndex}
                showChat={showChat}
            />
            {showChat && (
                <ChatPanel
                    messages={chatMessages}
                    setMessages={setChatMessages}
                    onSendMessage={onSendMessage}
                    isProcessing={isChatProcessing}
                    onStop={onStop}
                />
            )}
        </div>
    );
};

function MainLayout({ initialMode, initialUserContext }) {
    // 🏠 LOCAL STATE for mode (avoids Zustand useSyncExternalStore triggering re-renders)
    const [mode, setMode] = useState(initialMode || "Assessment");

    // Sync initial mode from setup
    useEffect(() => {
        if (initialMode) setModeAction(initialMode);
    }, [initialMode]);

    // 🏠 LOCAL STATE (Faster, no global overhead)
    const [captureCount, setCaptureCount] = useState(0);
    const [apiCallCount, setApiCallCount] = useState(0);
    const [language, setLanguage] = useState("Python");
    const [scenario, setScenario] = useState("Coding");
    const [isAppFocused, setIsAppFocused] = useState(false);

    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [chatMessages, setChatMessages] = useState([
        { role: "assistant", content: [{ type: 'text', content: "Hello!! I’m ShadowLith." }] }
    ]);

    const [showDashboard, setShowDashboard] = useState(true);
    const [showPanels, setShowPanels] = useState(true);

    // Ticker Logic
    const tickerRef = useRef(null);
    const [isTickerHovered, setIsTickerHovered] = useState(false);

    // --- HOOKS ---

    // AI Stream Handler
    const ai = useAIStream(
        // On Chat Result
        (blocks, hasTech) => {
            const finalBlocks = [...blocks];
            if (hasTech && scenario !== 'Video') {
                finalBlocks.push({
                    type: 'text',
                    content: "\n\n💡 Response Panel updated with new logic."
                });
            }
            setChatMessages(prev => [...prev, { role: "assistant", content: finalBlocks }]);
        },
        // On Response Result
        (result) => {
            if (result.error) {
                setData({ blocks: [{ type: 'warning', content: result.message }] });
                bridge.revokeSnip();
                setCaptureCount(0);
                return;
            }
            setData(result);
            setHistory(h => {
                const updated = [...h, { data: result }];
                setHistoryIndex(updated.length - 1);
                return updated;
            });
            bridge.revokeSnip();
            setCaptureCount(0);
        }
    );

    // Snip Result Global Handler
    useEffect(() => {
        window.__onCaptureUpdate = (status, count) => {
            if (status === 'success') {
                setCaptureCount(count);
                // If this was an 'Analyse Snippet' trigger, auto-solve now
                if (window.__onCaptureUpdateTarget === 'solve') {
                    window.__onCaptureUpdateTarget = null;
                    handleProcess(false);
                }
            }
        };

        window.__onApiCallUpdate = (count) => {
            setApiCallCount(count);
        };

        return () => {
            delete window.__onCaptureUpdate;
            delete window.__onApiCallUpdate;
        };
    }, [mode, language, scenario]); // dependencies for handleProcess closure

    // Audio Handler
    const audio = useAudioIO((transcript) => {
        handleProcess(false, transcript);
    });

    // Window Sync
    useWindowSync('main-layout-root', [
        mode, data
    ]);



    // Ticker Auto-Scroll Logic
    useEffect(() => {
        if (!isTickerHovered && tickerRef.current) {
            tickerRef.current.scrollTo({
                left: tickerRef.current.scrollWidth,
                behavior: 'smooth'
            });
        }
    }, [audio.liveTranscript, isTickerHovered]);

    // --- HANDLERS ---

    const handleProcess = async (isManual = true, transcript = null) => {
        const streamId = ai.startStream('analysis');

        // "Analyse Screen" (Manual) always takes a fresh fullscreen snap
        if (isManual) {
            const res = await bridge.captureFullscreen();
            if (res.status === 'success') {
                setCaptureCount(res.count);
            } else {
                ai.stopStream();
                return;
            }
        }

        const success = await bridge.startStreamAnswer({
            mode: mode,
            language: language,
            scenario: scenario,
            transcript: transcript || audio.liveTranscript,
            isAudit: false,
            streamId
        });

        if (success) audio.setLiveTranscript("");
        else ai.stopStream();
    };

    const handleSendMessage = async (message) => {
        setChatMessages(prev => [...prev, { role: "user", content: message }]);
        const streamId = ai.startStream('chat');
        await bridge.chat(message, audio.isListening, streamId);
    };

    const handleCaptureOCR = async () => {
        // Step 1: Just capture text to buffer
        await bridge.captureOCR();
    };

    const handleAnalyseSnippet = async () => {
        // Step 1: Snip Visual (Add to buffer, results handled via global callback)
        await bridge.captureVisual();
    };

    const handleAnalyseScreen = async () => {
        // Step 1: One-click Fullscreen Solve
        handleProcess(true);
    };

    const handleClear = async () => {
        // ONLY clear the current capture buffer/input
        await bridge.revokeSnip();
        setCaptureCount(0);
    };

    const handleReset = async () => {
        // FULL SESSION RESET: Clear buffer, current results, and history
        try {
            await bridge.resetChat(); // Backend reset (Buffer + AI Memory)
            setData(null);
            setHistory([]);
            setHistoryIndex(-1);
            setCaptureCount(0);
            setChatMessages([{ role: "assistant", content: [{ type: 'text', content: "Session reset complete. How can I help?" }] }]);
            audio.setLiveTranscript("");
        } catch (err) {
            console.error("Reset Failed:", err);
        }
    };

    // Control Bar Definition
    const controlItems = [
        {
            icon: <Camera size={14} />,
            label: 'Capture (OCR)',
            onClick: handleCaptureOCR,
            disabled: ai.isResponseProcessing
        },
        {
            icon: <Zap size={14} />,
            label: 'Analyse Snippet',
            onClick: handleAnalyseSnippet,
            disabled: ai.isResponseProcessing
        },
        {
            icon: <MonitorPlay size={14} />,
            label: 'Analyse Screen',
            onClick: handleAnalyseScreen,
            disabled: ai.isResponseProcessing
        },
        mode === "Interview" && {
            icon: <Mic size={14} className={audio.isListening ? "text-red-500 animate-pulse" : ""} />,
            label: audio.isListening ? "Listening..." : "Listen",
            onClick: audio.toggleListening
        },

        {
            icon: <Eraser size={14} />,
            label: 'Clear Snips',
            onClick: handleClear,
            disabled: captureCount === 0
        },
        {
            icon: <RotateCcw size={14} />,
            label: 'Reset Session',
            onClick: handleReset,
            disabled: captureCount === 0 && !data && history.length === 0 && !audio.liveTranscript
        },
        {
            icon: ai.isResponseProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />,
            label: ai.isResponseProcessing ? 'Solve [Process]' : 'Process',
            onClick: () => handleProcess(false),
            disabled: (captureCount === 0 && !audio.liveTranscript) || ai.isResponseProcessing
        },
        ai.isResponseProcessing && {
            icon: <Square size={14} fill="red" className="text-red-500" />,
            label: 'Stop',
            onClick: () => { ai.stopStream(); bridge.stopStream(); bridge.revokeSnip(); setCaptureCount(0); },
            variant: 'danger'
        }
    ].filter(Boolean);

    return (
        <div id="main-layout-root"
            className={`relative flex flex-col gap-1 w-[60rem] transition-opacity duration-200 ${isAppFocused ? 'opacity-100' : 'opacity-95'}`}
            onMouseEnter={() => { setIsAppFocused(true); bridge.setInteractivity(true); }}
            onMouseLeave={() => setIsAppFocused(false)}
        >
            <TopBar
                captureCount={captureCount}
                apiCallCount={apiCallCount}
                language={language}
                setLanguage={setLanguage}
                scenario={scenario}
                setScenario={setScenario}
                mode={mode}
                setMode={(val) => { setMode(val); setModeAction(val); }}
                onHide={() => bridge.toggleUI()}
                onQuit={() => bridge.terminateApp()}
                showDashboard={showDashboard}
                toggleDashboard={() => setShowDashboard(!showDashboard)}
            />

            {showDashboard && (
                <div className="flex flex-col gap-1">
                    <ControlBar items={controlItems} showPanels={showPanels} setShowPanels={setShowPanels} />

                    {/* Activity Monitor / Transcript Ticker */}
                    {(audio.isListening || audio.liveTranscript) && (
                        <div
                            className="transcript-container group relative flex items-center gap-1 p-1 px-3 h-10 bg-zinc-900/75 border-zinc-800 rounded-md transition-all duration-300 hover:border-zinc-700/60 overflow-hidden"
                            onMouseEnter={() => setIsTickerHovered(true)}
                            onMouseLeave={() => setIsTickerHovered(false)}
                        >
                            {/* Status / Action Toggle */}
                            <button
                                onClick={() => {
                                    audio.setLiveTranscript("");
                                    setHistory([]);
                                    setHistoryIndex(-1);
                                    setData(null);
                                }}
                                className="relative flex items-center justify-center w-[45px] h-full transition-colors duration-200"
                            >
                                <div className="flex flex-col items-start leading-none gap-0.5">
                                    <span
                                        className={`text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isTickerHovered ? "text-red-500 translate-y-0 opacity-100" : "text-emerald-500"
                                            }`}
                                    >
                                        {isTickerHovered ? "Clear" : "Live"}
                                    </span>

                                </div>
                            </button>

                            {/* Vertical Separator */}
                            <div className="h-4 w-[1px] bg-zinc-800" />

                            {/* Transcript Content */}
                            <div
                                ref={tickerRef}
                                className="transcript-scrollbar flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide select-none pl-3"
                            >
                                <p className={`text-xs font-medium transition-colors duration-300 ${audio.liveTranscript ? "text-zinc-200" : "text-zinc-500 italic"
                                    }`}>
                                    {audio.liveTranscript || "Awaiting audio input..."}

                                    {/* Dynamic Cursor / Pulse */}
                                    {audio.isListening && (
                                        <span className="ml-2 inline-flex gap-0.5 items-center">
                                            <span className="w-1 h-3 bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]" />
                                            <span className="w-1 h-3 bg-emerald-500/50 animate-[pulse_1s_ease-in-out_0.2s_infinite]" />
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Subtle Vignette Overlay for scrolling depth */}
                        </div>
                    )}

                    {showPanels && (
                        <ContentArea
                            data={data}
                            setData={setData}
                            streamingText={ai.streamingText}
                            isResponseProcessing={ai.isResponseProcessing}
                            isChatProcessing={ai.isChatProcessing}
                            history={history}
                            historyIndex={historyIndex}
                            setHistoryIndex={setHistoryIndex}
                            chatMessages={chatMessages}
                            setChatMessages={setChatMessages}
                            onSendMessage={handleSendMessage}
                            onStop={() => { ai.stopStream(); bridge.stopStream(); }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default MainLayout;
