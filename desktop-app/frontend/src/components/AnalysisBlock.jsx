import React, { useState } from 'react';
import { Clock, Database, BarChart3 } from 'lucide-react';

const AnalysisBlock = ({ time, space, complexityLabel = "Performance Metrics" }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="border-l-2 border-zinc-500/40 bg-zinc-500/5 rounded-r-md relative group my-2">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 p-3 text-zinc-400 text-[10px] font-bold uppercase tracking-widest opacity-70 hover:bg-zinc-500/10 transition-colors cursor-pointer"
            >
                <BarChart3 size={12} /> {complexityLabel}
            </div>
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-6 py-2 px-4 bg-zinc-950/50 border border-zinc-800/50 rounded-md w-max">
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-zinc-500" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Time</span>
                            <span className="text-sm font-mono text-emerald-500 ml-1">{time || "N/A"}</span>
                        </div>

                        <div className="w-px h-3 bg-zinc-800" />

                        <div className="flex items-center gap-2">
                            <Database size={12} className="text-zinc-500" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Space</span>
                            <span className="text-sm font-mono text-blue-500 ml-1">{space || "N/A"}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisBlock;
