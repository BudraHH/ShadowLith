import React from 'react';
import { BookOpen, ChevronLeft } from 'lucide-react';

const ExplanationPanel = ({
    showExplanation,
    setShowExplanation,
    explanationData,
    renderBlocks,
    renderHeaderBadges
}) => {
    return (
        <div className={`flex flex-col transition-all duration-300 ${showExplanation ? 'w-[400px] pointer-events-auto' : 'w-12 shrink-0 pointer-events-auto'} bg-[#030303] border border-zinc-800 rounded-md overflow-hidden min-w-0`}>
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
                {showExplanation && <ChevronLeft className={`w-4 h-4 text-zinc-600 hover:text-zinc-300 transition-colors`} />}
            </div>
            {showExplanation && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar">
                    {explanationData ? (
                        <>
                            {renderHeaderBadges(explanationData)}
                            {renderBlocks(explanationData.blocks)}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600">
                            <div className="text-center">
                                <p>No Context Loaded</p>
                                <p className="text-xs opacity-50">Capture a region to begin</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExplanationPanel;
