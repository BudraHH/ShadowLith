import React from 'react';
import { Camera, Zap, Mic, MonitorPlay, Trash2, Send, Loader2, Square, MessageSquare, ChevronDown } from 'lucide-react';
import { useAppStore, setShowChatAction } from '../../store/useAppStore';

const ControlButton = ({ icon, label, onClick, disabled, variant = "default" }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center px-2 py-[5px] group justify-between gap-2 bg-zinc-800 rounded text-xs text-white/90 focus:outline-none focus:border-zinc-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${variant === 'danger' ? 'hover:text-red-500' : 'hover:text-white'}`}
    >
        {icon}
        {label}
    </button>
);
const ControlBar = React.memo(({ items, setShowPanels, showPanels }) => {
    const showChat = useAppStore(state => state.showChat);
    
    return (
        <div className="pywebview-drag-region flex flex-row justify-between items-center p-2 w-full bg-zinc-900/75 border-zinc-800 rounded-md select-none hover:border-zinc-700/50 transition-colors shrink-0 cursor-default z-50 relative pointer-events-auto">
            <div className="flex flex-row items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
                {items.map((item, idx) => (
                    <ControlButton key={idx} {...item} />
                ))}
            </div>
            <div className="flex flex-row items-center gap-1">
                <ControlButton
                icon={<MessageSquare size={14} className={showChat ? "text-white group-hover:text-zinc-500" : "text-zinc-500 group-hover:text-white"} />}
                label={showChat ? 'Hide' : 'Chat'}
                onClick={() => setShowChatAction(!showChat)}
            />
             <div onClick={() => setShowPanels(!showPanels)} className="group flex items-center justify-center p-[6px] rounded bg-zinc-800 hover:bg-zinc-900 cursor-pointer transition-colors">
                    <ChevronDown size={14} className={`transform transition-transform ${showPanels ? "rotate-180" : "rotate-0"} text-white/80`} />
                </div>
            </div>
        </div>
    );
});

export default ControlBar;
