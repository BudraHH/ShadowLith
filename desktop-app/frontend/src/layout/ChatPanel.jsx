import React from 'react';
import { MessageSquare, ChevronLeft } from 'lucide-react';
import ChatWindow from "../components/ChatWindow";

const ChatPanel = ({ showChat, setShowChat, showExplanation, showAnswer, messages, setMessages, liveTranscript, isListening }) => {
    const onlyChat = !showExplanation && !showAnswer;
    return (
        <div className={`flex flex-col transition-all duration-300 ${showChat ? (!onlyChat ? 'w-[400px] pointer-events-auto' : 'w-[415px]') : 'w-12 shrink-0 pointer-events-auto'} bg-[#030303] border border-zinc-800 rounded-md overflow-hidden min-w-0`}>
            <div
                className={`flex items-center ${showChat ? 'justify-between' : 'justify-center'} p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors`}
                onClick={() => setShowChat(!showChat)}
            >
                <div className="flex items-center gap-2 text-slate-400">
                    <MessageSquare size={16} className={showChat ? "text-slate-400" : "text-slate-400"} />
                    {showChat && (
                        <span className="font-semibold uppercase text-xs">Chat</span>
                    )}
                </div>
                {showChat && <ChevronLeft className={`w-4 h-4 text-slate-500 hover:text-slate-500 transition-colors`} />}
            </div>
            {showChat && (
                <div className="flex-1 overflow-hidden h-full">
                    <ChatWindow
                        messages={messages}
                        setMessages={setMessages}
                        liveTranscript={liveTranscript}
                        isListening={isListening}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatPanel;
