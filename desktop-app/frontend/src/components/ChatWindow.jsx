import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User, Trash2 } from "lucide-react";
import Button from "./Button";
import CodeBlock from "./CodeBlock";

function ChatWindow({ messages, setMessages }) {
    const [input, setInput] = useState("");
    // messages state lifted to MainLayout
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        const newMessages = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            if (window.pywebview) {
                // Call Python Backend
                const rawResponse = await window.pywebview.api.chat(userMsg);

                // Parse the structured JSON response
                let parsed;
                try {
                    parsed = JSON.parse(rawResponse);
                } catch (e) {
                    // Handle case where raw string is returned
                    parsed = { blocks: [{ type: 'text', content: rawResponse }] };
                }

                if (typeof parsed === 'string') {
                    const cleaned = parsed.replace(/```json/g, '').replace(/```/g, '').trim();
                    parsed = JSON.parse(cleaned);
                }

                // Extract relevant blocks for chat
                // We now include 'code' blocks to support the user's request
                const aiBlocks = parsed.blocks
                    ?.filter(b => ['text', 'code', 'section', 'strategy'].includes(b.type))
                    ?.map(b => ({
                        type: b.type,
                        content: b.content,
                        lang: b.lang
                    })) || [{ type: 'text', content: "I processed that, but had no text response." }];

                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: aiBlocks // Store array of blocks
                }]);
            } else {
                // Fallback for dev mode
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "(Dev Mode) Echo: " + userMsg
                    }]);
                    setIsTyping(false);
                }, 1000);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Error: Failed to connect to ShadowLith Intelligence."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] overflow-hidden cursor-default">
            {/* Header Managed by MainLayout Wrapper */}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 thin-scrollbar bg-zinc-950/30">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 opacity-50">
                        <Bot size={32} />
                        <span className="text-xs">No messages yet</span>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`rounded-md text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 max-w-[85%] px-3 py-2'
                                : 'bg-transparent text-zinc-300 w-full'
                                }`}
                        >
                            {/* Check if content is an array of blocks (New Structure) */}
                            {Array.isArray(msg.content) ? (
                                <div className="flex flex-col max-w-[95%]">
                                    {msg.content.map((block, bIdx) => {
                                        if (block.type === 'code') {
                                            return (
                                                <div key={bIdx} className="w-full ">
                                                    <CodeBlock code={block.content} language={block.lang || 'javascript'} />
                                                </div>
                                            );
                                        }
                                        // Default to text (Styled as a bubble)
                                        return (
                                            <div key={bIdx} className="bg-zinc-800/50 border border-zinc-700/50 rounded-md px-3 py-2 whitespace-pre-wrap ">
                                                {block.content}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Fallback for legacy string messages
                                <span className="whitespace-pre-wrap">{msg.content}</span>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start ml-1">
                        <div className="flex items-center gap-1 bg-zinc-800/40 border border-zinc-700/40 rounded-md px-3 py-4 w-fit">
                            <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600"
                        autoFocus
                    />
                    <Button
                        variant={input.trim() ? "primary" : "secondary"}
                        onClick={handleSend}
                        className={!input.trim() ? "opacity-50 cursor-not-allowed" : ""}
                        disabled={!input.trim()}
                    >
                        <Send size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
