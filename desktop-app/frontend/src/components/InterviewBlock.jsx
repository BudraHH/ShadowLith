import React from 'react';
import { MessageSquare, Activity } from 'lucide-react';

const InterviewBlock = ({ content }) => {
    return (
        <div className="my-5 p-4 border-l-2 border-blue-500/40 bg-blue-500/5 rounded-r-md relative group">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3 opacity-70">
                <MessageSquare size={12} /> Talking Points
            </div>
            <div className="text-zinc-100 text-[15px] leading-relaxed font-regular">
                "{content}"
            </div>
        </div>
    );
};

export default InterviewBlock;
