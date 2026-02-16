import React from 'react';
import { Sparkles, ChevronLeft, Terminal } from 'lucide-react';

const SolutionPanel = ({
    showAnswer,
    setShowAnswer,
    showExplanation,
    showChat,
    data,
    renderBlocks,
    renderHeaderBadges,
    isProcessing
}) => {
    const onlyAnswer = !showExplanation && !showChat;
    return (
        <div className={`flex flex-col transition-all duration-300 ${showAnswer ? (!onlyAnswer ? 'w-[400px] pointer-events-auto' : 'w-[415px]') : 'w-12 shrink-0 pointer-events-auto'} bg-[#030303] border border-zinc-800 rounded-md overflow-hidden min-w-0`}>
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
                            {isProcessing ? (
                                <div className="text-center animate-pulse text-emerald-500/50"> 
                                    <p className="font-semibold text-sm">Thinking...</p>
                                    <p className="text-[10px] opacity-70">Generating optimal solution</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-1 select-none">
                                    <p className="text-zinc-400 font-medium text-xs">No solution generated</p>
                                    <p className="text-[10px] text-zinc-500">Use <span className="font-bold text-zinc-400">Capture</span> to solve</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SolutionPanel;
