import React, { useState } from 'react';
import { FileText, Briefcase, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';
import WindowBar from '../components/ui/WindowBar';
import { useWindowResizeSync } from '../utils/useWindowResizeSync';
import { bridge } from '../api/bridge';

const ContextSetup = ({ onComplete, onBack }) => {
    useWindowResizeSync('context-setup', 'resize-target');
    const [resume, setResume] = useState("");
    const [jd, setJd] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Add a slight delay for "Processing" feel
        setTimeout(() => {
            onComplete({ resume, jd });
        }, 800);
    };

    return (
        <div
            id="resize-target"
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-h-[90vh] min-h-[50rem] w-[60rem] bg-[#030303] text-zinc-100 select-auto overflow-y-auto rounded-md custom-scrollbar px-12 py-16"
        >
            <WindowBar
                title="Persona Calibration"
                onHide={() => bridge.toggleUI()}
                onQuit={() => bridge.terminateApp()}
            />

            {/* --- BACKDROP AMBIENCE --- */}

            {/* --- BACKDROP AMBIENCE --- */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none z-0" />

            <div className="max-w-3xl w-full space-y-10 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 relative z-10">

                {/* --- HEADER --- */}
                <div className="space-y-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                        PERSONA CALIBRATION
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium tracking-wide">
                        Provide your specific background to ground the AI's script logic.
                    </p>
                </div>

                {/* --- INPUT FIELDS --- */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Job Description Input */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <Briefcase size={16} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Job Description</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${jd.trim().length < 100 ? "text-zinc-600" : "text-emerald-500/80"}`}>
                                {jd.trim().length < 100 ? "More Context Required" : "JD Calibrated"}
                            </span>
                        </div>
                        <textarea
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            onKeyUp={(e) => e.stopPropagation()}
                            placeholder="Paste the JD here (Requirements, Responsibilities, Tech Stack)..."
                            className="w-full h-64 bg-zinc-900/40 border border-zinc-800/50 rounded-md p-4 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all resize-none placeholder:text-zinc-700 font-medium leading-relaxed custom-scrollbar select-text cursor-text pointer-events-auto"
                        />
                    </div>

                    {/* Resume Input */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <FileText size={16} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Your Resume</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${resume.trim().length < 100 ? "text-zinc-600" : "text-blue-500/80"}`}>
                                {resume.trim().length < 100 ? "Data Insufficient" : "Resume Grounded"}
                            </span>
                        </div>
                        <textarea
                            value={resume}
                            onChange={(e) => setResume(e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            onKeyUp={(e) => e.stopPropagation()}
                            placeholder="Paste your resume content (Experience, Projects, Skills)..."
                            className="w-full h-64 bg-zinc-900/40 border border-zinc-800/50 rounded-md p-4 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-zinc-700 font-medium leading-relaxed custom-scrollbar select-text cursor-text pointer-events-auto"
                        />
                    </div>
                </div>

                {/* --- ACTION --- */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (resume.trim().length < 100) || (jd.trim().length < 100)}
                        className="group relative text-sm flex items-center gap-3 px-8 py-2 text-black rounded-md font-semibold overflow-hidden transition-all bg-white hover:bg-white active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2 animate-pulse">
                                INITIALIZING CORE...
                            </span>
                        ) : (
                            <>
                                START INTERVIEW SESSION
                                <ChevronRight size={16} />
                            </>
                        )}
                    </button>

                    <p className="mt-6 text-[10px] text-zinc-600 font-medium uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles size={12} className="text-emerald-500" />
                        Grounding analysis in provided context
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ContextSetup;
