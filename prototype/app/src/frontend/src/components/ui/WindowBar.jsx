import React from 'react';
import { X, Minus } from 'lucide-react';

const WindowBar = ({  onHide, onQuit }) => {
    return (
        <div className="pywebview-drag-region absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-transparent z-50">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse-crash-detection" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">ShadowLith</span>
            </div>

            <div className="flex items-center gap-1 no-drag">
                <button
                    onClick={(e) => { e.stopPropagation(); onHide(); }}
                    className="p-1.5 hover:bg-zinc-800/50 rounded-md text-zinc-600 hover:text-zinc-300 transition-colors pointer-events-auto"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onQuit(); }}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md text-zinc-600 transition-colors pointer-events-auto"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default WindowBar;
