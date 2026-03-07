import React, { useState, useEffect } from 'react';
import { Clock, EyeOff, Power, ChevronDown } from 'lucide-react';
import Select from './Select';

const formatTime = (date) => (date instanceof Date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "");

const TopBar = React.memo(({
    captureCount = 0,
    apiCallCount = 0,
    language = "Python",
    setLanguage = () => { },
    scenario = "Coding",
    setScenario = () => { },
    mode = "Assessment",
    setMode = () => { },
    onHide = () => { },
    onQuit = () => { },
    showDashboard = true,
    toggleDashboard = () => { }
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="pywebview-drag-region flex flex-row justify-between items-center p-2 w-full bg-zinc-900/75 border-zinc-800 rounded-md select-none hover:border-zinc-700/50 transition-colors shrink-0 relative pointer-events-auto">
            <div className="flex items-center gap-3 pl-2 pointer-events-none">
                <h1 className="text-sm font-semibold tracking-tighter text-zinc-200">SHADOWLITH</h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-100/5">
                    <span className={`text-[10px] font-mono tracking-wide ${apiCallCount > 8 ? "text-red-400 animate-pulse" : apiCallCount > 5 ? "text-amber-400" : "text-emerald-500/80"}`}>
                        {apiCallCount}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">API calls / 10</span>
                </div>
                {captureCount > 0 && (
                    <span className="bg-blue-900/40 text-blue-300 text-[10px] px-2 py-0.5 rounded-md border border-blue-500/20 font-medium">
                        {captureCount} {captureCount > 1 ? 'Snippets' : 'Snippet'}
                    </span>
                )}
            </div>

            <div className="flex flex-row items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex items-center px-2 py-[5px] justify-between gap-2 bg-zinc-800 group rounded text-xs text-white/90 font-mono">
                    <Clock size={12} className="text-zinc-500" />
                    {formatTime(currentTime)}
                </div>

                {scenario === "Coding" && (
                    <Select
                        value={language}
                        onChange={setLanguage}
                        options={["Python", "Java", "C++", "JavaScript", "Go", "Rust", "SQL"]}
                        placeholder="Select"
                    />
                )}

                {mode === "Assessment" && (
                    <Select
                        value={scenario}
                        onChange={setScenario}
                        options={["Coding", "MCQ", "Video"]}
                        placeholder="Type"
                    />
                )}

                <Select
                    value={mode}
                    onChange={setMode}
                    options={["Assessment", "Interview"]}
                    placeholder="Mode"
                />

                <button onClick={onHide} className="flex items-center px-2 py-[5px] justify-between gap-2 bg-zinc-800 group hover:text-white hover:bg-zinc-900 rounded text-xs text-white/90 transition-all">
                    <EyeOff size={14} className="text-zinc-500" /> Hide
                </button>

                <button onClick={onQuit} className="flex items-center px-2 py-[5px] justify-between gap-2 bg-zinc-800 group hover:text-red-500 hover:bg-zinc-900 rounded text-xs text-white/90 transition-all">
                    <Power size={14} className="text-zinc-500" /> Quit
                </button>

                <div onClick={toggleDashboard} className="group flex items-center justify-center p-[6px] rounded bg-zinc-800 hover:bg-zinc-900 cursor-pointer transition-colors">
                    <ChevronDown size={14} className={`transform transition-transform ${showDashboard ? "rotate-180" : "rotate-0"} text-white/80`} />
                </div>
            </div>
        </div>
    );
});

export default TopBar;
