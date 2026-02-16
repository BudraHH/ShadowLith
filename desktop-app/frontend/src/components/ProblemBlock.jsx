import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ProblemBlock = ({ content }) => {

    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border-l-2 border-rose-500/40 bg-rose-500/5 rounded-r-md relative group">
            <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 p-4 text-rose-400 text-[10px] font-bold uppercase tracking-widest  opacity-70 hover:bg-rose-500/10 transition-colors ">
                <Search size={12} /> Problem Analysis
            </div>
            {isExpanded && ( <div className="px-4 pb-4 text-zinc-300 text-[14px] leading-relaxed">
                {content}
            </div>)}
        </div>
    );
};

export default ProblemBlock;
