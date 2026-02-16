import React from 'react';
import { Zap, User, Sparkles, Binary, ShieldCheck } from 'lucide-react';

const ModeSelection = ({ onSelect }) => {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen w-[1240px] bg-[#030303] text-zinc-100 p-8 select-none overflow-hidden rounded-md">
            <div className="absolute top-0 left-0 right-0 pywebview-drag-region h-[30px] w-full bg-zinc-900/50  rounded-t-md z-50">

            </div>
            {/* --- BACKDROP AMBIENCE --- */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

            <div className="max-w-2xl w-full space-y-12 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 relative z-10">

                {/* --- LOGO SECTION --- */}
                <div className="text-center space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                        SHADOWLITH
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium tracking-wide">
                        Choose your operational core for this session
                    </p>
                </div>

                {/* --- CARDS SECTION --- */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Assessment Mode */}
                    <div
                        onClick={() => onSelect("Assessment")}
                        className="group relative flex flex-col p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-zinc-800/30 transition-all duration-500 overflow-hidden"
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            {/* <div className="w-14 h-14 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-500">
                                <Zap className="text-zinc-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" size={28} />
                            </div> */}

                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-zinc-100">Assessment</h3>
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-widest">Efficiency</span>
                            </div>

                            <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                Optimized for rapid problem solving. Focuses on code correctness, edge cases, and algorithmic complexity with hyper-concise output.
                            </p>

                            <div className="mt-8 flex items-center gap-2 text-[9px] font-mono text-zinc-600">
                                <Binary size={12} />
                                <span>SYSTEM_LOGIC_CORE_ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Interview Mode */}
                    <div
                        onClick={() => onSelect("Interview")}
                        className="group relative flex flex-col p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-800/30 transition-all duration-500 overflow-hidden"
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            {/* <div className="w-14 h-14 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-500">
                                <User className="text-zinc-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500" size={28} />
                            </div> */}

                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-zinc-100">Interview</h3>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-widest">Pedagogy</span>
                            </div>

                            <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                Tailored for technical discussions. Provides deep strategy analysis, interview talking points, and structured logical walkthroughs.
                            </p>

                            <div className="mt-8 flex items-center gap-2 text-[9px] font-mono text-zinc-600">
                                <ShieldCheck size={12} />
                                <span>HUMAN_INTEL_SIM_V4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER SECTION --- */}
                <div className="pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 font-medium">
                    <p className="flex items-center gap-2 uppercase tracking-widest">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        Neural Bridge: Ready
                    </p>

                    <p className="uppercase tracking-widest">
                        Session Ref: {Math.random().toString(36).substring(7).toUpperCase()}
                    </p>
                </div>
                <p className="italic border-l-2 border-yellow-500/50 leading-relaxed  text-yellow-300/60 text-sm pl-2">
                    Operational modes are toggleable mid-session if required, though consistent profiling
                    is recommended. Adjust only if strictly necessary.
                </p>
            </div>
        </div>
    );
};

export default ModeSelection;
