import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User, Trash2 } from "lucide-react";
import Button from "./Button";

function ChatWindow() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello!!" },
        { role: "assistant", content: "I’m here to support you through this assessment/interview. How can I help you right now?" }
    ]);
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
                const rawResponse = await window.pywebview.api.chat(userMsg);
                let parsed = JSON.parse(rawResponse);

                // If it's a string disguised as JSON
                if (typeof parsed === 'string') {
                    const cleaned = parsed.replace(/```json/g, '').replace(/```/g, '').trim();
                    parsed = JSON.parse(cleaned);
                }

                // Extract text from blocks
                const aiText = parsed.blocks
                    ?.filter(b => b.type === 'text')
                    ?.map(b => b.content)
                    ?.join('\n\n') || "I processed that, but had no text response.";

                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: aiText
                }]);
            } else {
                // Fallback for dev mode without backend
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "ShadowLith backend not connected. This is a local simulated response."
                    }]);
                }, 600);
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
                            className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20'
                                : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800/30 text-zinc-500 border border-zinc-700/30 rounded-md px-3 py-1 text-[10px] animate-pulse">
                            ShadowLith is thinking...
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
