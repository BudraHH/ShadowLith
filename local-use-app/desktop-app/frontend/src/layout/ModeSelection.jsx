import WindowBar from '../components/ui/WindowBar';
import { useWindowResizeSync } from '../utils/useWindowResizeSync';
import { bridge } from '../api/bridge';

const ModeSelection = ({ onSelect }) => {
    useWindowResizeSync('mode-selection', 'resize-target');
    return (
        <div id="resize-target" className="relative flex flex-col items-center justify-center min-h-[50rem] max-h-[85vh] w-[60rem] bg-[#030303] text-zinc-100 p-8 select-none overflow-hidden rounded-md">
            <WindowBar
                title="Operational Core"
                onHide={() => bridge.toggleUI()}
                onQuit={() => bridge.terminateApp()}
            />

            {/* --- BACKDROP AMBIENCE --- */}
            {/* --- BACKDROP AMBIENCE --- */}
            <div className="w-full max-w-[700px] space-y-12 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700 relative z-10">

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
                <div className="grid grid-cols-1 gap-6 max-w-2xl w-full mx-auto">
                    {/* Assessment Mode */}
                    <div
                        onClick={() => onSelect("Assessment")}
                        className="group relative flex flex-col p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-md cursor-pointer hover:border-blue-500/50 hover:bg-zinc-800/30 transition-all duration-500 overflow-hidden"
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-zinc-100">Assessment</h3>
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-widest">Efficiency</span>
                            </div>

                            <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                Optimized for fast problem solving. Focuses on correct code and efficiency with short, clear explanations.
                            </p>


                        </div>
                    </div>

                    {/* Interview Mode */}
                    <div
                        onClick={() => onSelect("Interview")}
                        className="group relative flex flex-col p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-md cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-800/30 transition-all duration-500 overflow-hidden"
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-zinc-100">Interview</h3>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-widest">Pedagogy</span>
                            </div>

                            <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                Grounds answers in your Resume and Job Description. Generates natural, human-like scripts for technical and behavioral discussions using simple English.
                            </p>

                        </div>
                    </div>
                </div>

                {/* --- FOOTER SECTION --- */}

                <p className="italic border-l-2 border-amber-500/50 leading-relaxed text-amber-200/60 text-xs pl-4 py-1 bg-amber-500/5 rounded-r-md">
                    Select your mode. Interview mode will ask for your resume and job details to help with your answers.
                    All stealth features start automatically once you begin.
                </p>
            </div>
        </div>
    );
};

export default ModeSelection;
