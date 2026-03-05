import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, ChevronDown, Activity, Camera, Zap, Mic, MonitorPlay, Trash2, Send, Loader2, Square } from "lucide-react";

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
            if (hasTech && store.scenario !== 'Video') {
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

        if (isManual && captureCount === 0) {
            const res = await bridge.captureFullscreen();
            if (res.status === 'success') setCaptureCount(res.count);
            else { ai.stopStream(); return; }
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

    const handleCapture = async () => {
        const res = await bridge.capture();
        if (res.status === 'success') setCaptureCount(res.count);
    };

    const handleClear = async () => {
        await bridge.revokeSnip();
        setCaptureCount(0);
        setData(null);
        setHistory([]);
        setHistoryIndex(-1);
        audio.setLiveTranscript("");
    };

    // Control Bar Definition
    const controlItems = [
        { icon: <Camera size={14} />, label: 'Capture', onClick: handleCapture },
        mode === "Interview" && {
            icon: <Mic size={14} className={audio.isListening ? "text-red-500 animate-pulse" : ""} />,
            label: audio.isListening ? "Listening..." : "Listen",
            onClick: audio.toggleListening
        },
        {
            icon: <Zap size={14} />,
            label: 'Analyse Snippet',
            onClick: () => handleProcess(false),
            disabled: ai.isResponseProcessing
        },

        { icon: <MonitorPlay size={14} />, label: 'Analyse Screen', onClick: () => handleProcess(true) },
        { icon: <Trash2 size={14} />, label: 'Clear', onClick: handleClear, disabled: captureCount === 0 && !data },
        {
            icon: ai.isResponseProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />,
            label: ai.isResponseProcessing ? 'Processing' : 'Process',
            onClick: () => handleProcess(true),
            disabled: captureCount === 0 || ai.isResponseProcessing
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
