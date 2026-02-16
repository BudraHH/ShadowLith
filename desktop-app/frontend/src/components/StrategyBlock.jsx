import React, { useState } from 'react';
import { Zap } from 'lucide-react';

const StrategyBlock = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border-l-2 border-emerald-500/40 bg-emerald-500/5 rounded-r-md relative group">
            <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 p-4 text-emerald-400 text-[10px] font-bold uppercase tracking-widest opacity-70 hover:bg-emerald-500/10 transition-colors ">
                <Zap size={12} /> Solution Strategy
            </div>
            {isExpanded && ( <div className="px-4 pb-4 text-zinc-300 text-[14px] leading-relaxed">
                {content}
            </div>)}
        </div>
    );
};

export default StrategyBlock;
