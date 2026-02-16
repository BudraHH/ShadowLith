import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ArrowUpDown } from 'lucide-react';

const ExplanationPanel = ({
    showExplanation,
    setShowExplanation,
    showAnswer,
    showChat,
    explanationData,
    renderBlocks,
    renderHeaderBadges,
    isProcessing,
}) => {
    const [isReversed, setIsReversed] = useState(false);
    const onlyExplanation = !showAnswer && !showChat;

    const blocksToRender = explanationData?.blocks
        ? (isReversed ? [...explanationData.blocks].reverse() : explanationData.blocks)
        : [];

    return (
        <div className={`flex flex-col transition-all duration-300 ${showExplanation ? (!onlyExplanation ? 'w-[400px] pointer-events-auto' : 'w-[415px]') : 'w-12 shrink-0 pointer-events-auto'} bg-[#030303] border border-zinc-800 rounded-md overflow-hidden min-w-0`}>
            <div
                className={`flex items-center ${showExplanation ? 'justify-between' : 'justify-center'} p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors`}
                onClick={() => setShowExplanation(!showExplanation)}
            >
                <div className="flex items-center gap-2 text-zinc-400">
                    <BookOpen size={16} className={showExplanation ? "text-zinc-500" : "text-zinc-300"} />
                    {showExplanation && (
                        <span className="font-semibold uppercase text-xs text-zinc-300">Explanation</span>
                    )}
                </div>
                {showExplanation && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsReversed(!isReversed); }}
                            className="text-zinc-600 hover:text-zinc-300 transition-colors"
                            title="Reverse Order"
                        >
                            <ArrowUpDown size={14} />
                        </button>
                        <ChevronLeft className={`w-4 h-4 text-zinc-600 hover:text-zinc-300 transition-colors`} />
                    </div>
                )}
            </div>
            {showExplanation && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar">
                    {explanationData ? (
                        <>
                            {renderHeaderBadges(explanationData)}
                            {renderBlocks(blocksToRender)}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600">
                            {isProcessing ? (
                                <div className="text-center animate-pulse">
                                    <p className="font-semibold text-zinc-400">Thinking...</p>
                                    <p className="text-xs opacity-80">Analyzing problem context</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-1 select-none">
                                    <p className="text-zinc-400 font-medium text-xs">No explanations yet</p>
                                    <p className="text-[10px] text-zinc-500">Use <span className="font-bold text-zinc-400">Capture</span> to analyze</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExplanationPanel;
