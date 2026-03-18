import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ArrowUpDown, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { parsePartialGeminiStream } from '../utils/streamParser';
import { renderBlocks } from '../utils/blockRenderer';

const ResponsePanel = ({
    data,
    setData,
    streamingText,
    isProcessing,
    history,
    historyIndex,
    setHistoryIndex,
    showChat,
    mode
}) => {
    const [isReversed, setIsReversed] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const scrollRef = useRef(null);

    const navigateToVersion = (idx) => {
        if (idx >= 0 && idx < history.length) {
            setHistoryIndex(idx);
            setData(history[idx].data);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [streamingText, data]);

    const sortBlocks = (blocks) => {
        if (!blocks || mode !== "Interview") return blocks || [];
        const priority = { 'interview': 1, 'strategy': 2 };
        return [...blocks].sort((a, b) => (priority[a.type] || 99) - (priority[b.type] || 99));
    };

    const blocksToRender = data?.blocks
        ? (isReversed ? sortBlocks([...data.blocks]).reverse() : sortBlocks(data.blocks))
        : [];

    const streamedData = streamingText ? parsePartialGeminiStream(streamingText) : null;
    const sortedStreamedBlocks = streamedData ? sortBlocks(streamedData.blocks) : null;

    return (
        <div className={`flex flex-col flex-1 rounded-md overflow-hidden bg-black/90 border border-zinc-800/50 ${showChat ? 'w-3/5' : 'w-full'}`}>
            {/* Header */}
            <div className="flex flex-row justify-between items-center p-2 bg-black/80 border-b border-zinc-800/50 select-none">
                <div className='flex items-center gap-4'>
                    <span className="font-semibold uppercase text-[10px] tracking-widest text-zinc-400">
                        {streamingText ? "Live Intelligence" : "Response Analysis"}
                    </span>

                    {history?.length > 1 && !streamingText && (
                        <div className='flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800/50'>
                            <button onClick={() => navigateToVersion(historyIndex - 1)} disabled={historyIndex <= 0} className="text-zinc-500 hover:text-white disabled:opacity-30">
                                <ChevronLeft size={14} />
                            </button>
                            <span className='text-[10px] font-mono text-zinc-400 min-w-[30px] text-center'>
                                {historyIndex + 1} / {history.length}
                            </span>
                            <button onClick={() => navigateToVersion(historyIndex + 1)} disabled={historyIndex >= history.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-30">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {streamingText && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            <Activity size={10} className="text-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-400 uppercase">Syncing</span>
                        </div>
                    )}
                    <button onClick={() => setIsReversed(!isReversed)} className={`p-1.5 rounded hover:bg-zinc-800 ${isReversed ? 'text-blue-400' : 'text-zinc-500'}`}>
                        <ArrowUpDown size={14} />
                    </button>
                    <button onClick={() => setShowResponse(!showResponse)} className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700">
                        <ChevronDown size={14} className={`transform transition-transform ${showResponse ? "rotate-180" : "rotate-0"} text-white`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {showResponse && (
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar min-h-[100px]">
                    {sortedStreamedBlocks ? (
                        <div className="space-y-6 pb-10">
                            {renderBlocks(sortedStreamedBlocks, true)}
                            <div className="flex items-center gap-2 text-zinc-600 font-mono text-[10px] animate-pulse">
                                <Activity size={10} /> <span>PROCESSING_STREAM_CHUNK...</span>
                            </div>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">{renderBlocks(blocksToRender)}</div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
                            {isProcessing ? "Thinking..." : "System Standby"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResponsePanel;
