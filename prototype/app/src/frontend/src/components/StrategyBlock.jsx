import React, { useState } from 'react';
import { ChevronDown, Zap } from 'lucide-react';

const StrategyBlock = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="relative group text-white">
            <div className='flex w-full justify-between items-center'
            onClick={() => setIsExpanded(!isExpanded)}
            >
                <p className="flex items-center gap-2 py-1 text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
                    🎯 Strategy
                </p>
                <ChevronDown size={12} className="text-zinc-400" />
            </div>
            {isExpanded && (
                <div className="text-zinc-200 text-[14px] leading-relaxed italic">
                    {content}
                </div>
            )}
        </div>
    );
};

export default StrategyBlock;
