import React from 'react';
import { Zap, User, Sparkles, Binary, ShieldCheck } from 'lucide-react';

const ModelSelectionMockup = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full aspect-[4/3] mt-28 h-[700px] bg-[#030303] text-zinc-100 select-none overflow-hidden rounded-xl border border-zinc-800/50 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-[30px] w-full bg-zinc-950/50 rounded-t-xl z-50 border-b border-zinc-800/50 flex items-center px-4">
                {/* Browser-like dots/header if needed */}
            </div>

            {/* --- BACKDROP AMBIENCE --- */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

            <div className="max-w-2xl w-full space-y-6 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 relative z-10 p-6 md:p-12">

                {/* --- LOGO SECTION --- */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                        SHADOWLITH
                    </h1>
                    <p className="text-zinc-400 text-xs font-medium tracking-wide">
                        Choose your operational core for this session
                    </p>
                </div>

                {/* --- CARDS SECTION --- */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Assessment Mode */}
                    <div className="group relative flex flex-col p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl cursor-default overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-zinc-100">Assessment</h3>
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[6px] font-bold uppercase tracking-widest">Efficiency</span>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                Optimized for rapid problem solving. Focuses on code correctness, edge cases, and algorithmic complexity with hyper-concise output.
                            </p>
                        </div>
                    </div>

                    {/* Interview Mode */}
                    <div className="group relative flex flex-col p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl cursor-default overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-zinc-100">Interview</h3>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[6px] font-bold uppercase tracking-widest">Pedagogy</span>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                Tailored for technical discussions. Provides deep strategy analysis, interview talking points, and structured logical walkthroughs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER SECTION --- */}
                <div className="pt-6 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 font-medium">
                    <p className="flex items-center gap-2 uppercase tracking-widest">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        Neural Bridge: Ready
                    </p>
                    <p className="uppercase tracking-widest">
                        Session Ref: SL_X92K
                    </p>
                </div>
                <p className="italic border-l-2 border-yellow-500/50 leading-relaxed text-yellow-300/60 text-[10px] pl-2">
                    Operational modes are toggleable mid-session if required, though consistent profiling
                    is recommended. Adjust only if strictly necessary.
                </p>
            </div>

            {/* Subtle overlay to prevent interaction in mockup if desired, or let it hover */}
            <div className="absolute inset-0 z-[100] cursor-default" />
        </div>
    );
};

export default ModelSelectionMockup;
