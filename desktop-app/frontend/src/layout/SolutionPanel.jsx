import React from 'react';
import { Sparkles, ChevronLeft, Terminal } from 'lucide-react';

const SolutionPanel = ({
    showAnswer,
    setShowAnswer,
    data,
    renderBlocks,
    renderHeaderBadges
}) => {
    return (
        <div className={`flex flex-col transition-all duration-300 ${showAnswer ? 'w-[400px] pointer-events-auto' : 'w-12 shrink-0 pointer-events-auto'} bg-[#030303] border border-zinc-800 rounded-md overflow-hidden min-w-0`}>
            <div
                className={`flex items-center ${showAnswer ? 'justify-between' : 'justify-center'} p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors`}
                onClick={() => setShowAnswer(!showAnswer)}
            >
                <div className="flex items-center gap-2 text-emerald-500/90">
                    <Sparkles size={16} className={showAnswer ? "text-emerald-500/90" : "text-emerald-400"} />
                    {showAnswer && (
                        <span className="font-semibold uppercase text-xs">Solution</span>
                    )}
                </div>
                {showAnswer && <ChevronLeft className={`w-4 h-4 text-emerald-900 hover:text-emerald-500 transition-colors`} />}
            </div>
            {showAnswer && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 thin-scrollbar">
                    {data ? (
                        <>
                            {renderHeaderBadges(data)}
                            {renderBlocks(data.blocks)}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-emerald-950/20">
                            <Terminal size={48} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SolutionPanel;
