import React from 'react';
import { MessageSquare, Activity } from 'lucide-react';

const InterviewBlock = ({ content }) => {
    // Basic markdown bold parser (**text**) to highlight keywords
    const renderContent = (text) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part && part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-amber-200/90 font-bold bg-amber-400/10 px-1 rounded">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    return (
        <div className="relative group text-white">
            <div className="flex items-center gap-2 py-1 text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                ⭐ Answer Script
            </div>
            <div className="text-white text-[18px] leading-relaxed drop-shadow-md font-medium">
                {renderContent(content)}
            </div>
        </div>
    );
};

export default InterviewBlock;
