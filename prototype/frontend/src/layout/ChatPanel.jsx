import React from 'react';
import { MessageSquare, Trash2, X } from 'lucide-react';
import ChatWindow from "../components/ChatWindow";

const ChatPanel = ({
    messages,
    setMessages,
    onSendMessage,
    isProcessing,
    onStop
}) => {

    const handleClearChat = () => {
        setMessages([]);
    };

    return (
        <div className="flex flex-col w-2/5 min-h-[400px] rounded-md overflow-hidden bg-black/90 border border-zinc-800/50">
            {/* Header */}
            <div className="flex items-center justify-between p-2 bg-black/80 border-b border-zinc-800/50 select-none">
                <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase text-[10px] tracking-widest text-zinc-400">Intelligence Chat</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleClearChat} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors">
                        <Trash2 size={14} />
                    </button>
                    {/* The visibility Is handled by the parent MainLayout */}
                </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
                <ChatWindow
                    messages={messages}
                    onSendMessage={onSendMessage}
                    isProcessing={isProcessing}
                    onStop={onStop}
                />
            </div>
        </div>
    );
};

export default ChatPanel;
