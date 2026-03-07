import { useState, useEffect, useRef } from "react";
import { Send, Bot, Square } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { parsePartialGeminiStream } from "../utils/streamParser";

/**
 * ChatWindow
 * Reusable component for the conversation history and message input.
 */
function ChatWindow({ messages, onSendMessage, isProcessing, onStop, streamingText }) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const textAreaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingText]);

    // Auto-grow textarea logic
    useEffect(() => {
        if (textAreaRef.current) {
            const ta = textAreaRef.current;
            ta.style.height = '38px';
            if (input.trim().length > 0) {
                const scrollHeight = ta.scrollHeight;
                ta.style.height = Math.min(scrollHeight, 86) + 'px';
            }
            ta.scrollTop = ta.scrollHeight;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;
        const userMsg = input.trim();
        setInput("");
        if (onSendMessage) await onSendMessage(userMsg);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (isProcessing) onStop();
            else handleSend();
        }
    };

    const parsedStream = streamingText ? parsePartialGeminiStream(streamingText) : null;
    const streamBlocks = parsedStream ? parsedStream.blocks.filter(b => b.type === 'text') : [];

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-zinc-950/20">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar">
                {messages.length === 0 && !isProcessing && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 opacity-30">
                        <Bot size={32} />
                        <span className="text-[10px] uppercase tracking-widest">Awaiting User Input</span>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] px-3 py-2 rounded-md text-xs leading-relaxed border ${msg.role === 'user'
                            ? 'bg-blue-600/10 border-blue-500/20 text-blue-100'
                            : msg.isError
                                ? 'bg-red-950/20 border-red-500/20 text-red-100'
                                : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-300'
                            }`}>
                            {Array.isArray(msg.content) ? (
                                <div className="space-y-4">
                                    {msg.content.map((block, bIdx) => (
                                        block.type === 'code'
                                            ? <CodeBlock key={bIdx} code={block.content} language={block.lang || 'javascript'} />
                                            : <div key={bIdx} className="whitespace-pre-wrap">{block.content}</div>
                                    ))}
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Live Streaming Content */}
                {isProcessing && streamBlocks.length > 0 && (
                    <div className="flex justify-start">
                        <div className="max-w-[90%] px-3 py-2 rounded-md bg-zinc-800/40 border border-zinc-700/30 text-zinc-300 text-xs leading-relaxed">
                            {streamBlocks.map((block, bIdx) => (
                                <div key={bIdx} className="whitespace-pre-wrap">
                                    {block.content}
                                    {bIdx === streamBlocks.length - 1 && (
                                        <span className="inline-block w-1.5 h-3 ml-1 bg-zinc-400 animate-pulse align-middle" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Thinking Indicator */}
                {isProcessing && streamBlocks.length === 0 && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-zinc-800/20 border border-zinc-700/10">
                            {[0, 150, 300].map(delay => (
                                <div key={delay} className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Wrapper */}
            <div className="p-3 bg-zinc-900/40 border-t border-zinc-800/50">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={textAreaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message ShadowLith..."
                        className="flex-1 bg-black/40 border border-zinc-800 rounded-md px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600 resize-none max-h-[86px] thin-scrollbar"
                    />
                    <button
                        onClick={isProcessing ? onStop : handleSend}
                        disabled={!input.trim() && !isProcessing}
                        className={`w-10 h-10 flex items-center justify-center rounded transition-all ${isProcessing
                            ? 'bg-zinc-800 hover:bg-zinc-700'
                            : 'bg-white hover:scale-105 disabled:opacity-20 disabled:grayscale'
                            }`}
                    >
                        {isProcessing
                            ? <Square size={14} className="text-red-500" fill="currentColor" />
                            : <Send size={14} className="text-black" />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
