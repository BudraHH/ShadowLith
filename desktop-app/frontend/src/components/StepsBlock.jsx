import React, { useState } from 'react';
import { List } from 'lucide-react';

const StepsBlock = ({ steps }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!steps || !Array.isArray(steps)) return null;

    return (
        <div className="border-l-2 border-blue-500/40 bg-blue-500/5 rounded-r-md relative group my-4">
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 p-4 text-blue-400 text-[10px] font-bold uppercase tracking-widest opacity-70 hover:bg-blue-500/10 transition-colors cursor-pointer"
            >
                <List size={12} /> Implementation Steps
            </div>

            {/* List Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 group/item">
                            {/* Circle Marker */}
                            <div className="flex-shrink-0 w-5 h-5 flex text-center items-center justify-center text-[10px] font-mono text-zinc-200 group-hover/item:border-blue-500/30 group-hover/item:text-blue-400 transition-all">
                                Step {idx + 1}
                            </div>

                            {/* Text */}
                            <div className="text-zinc-300 text-[14px] leading-relaxed pt-0.5 font-regular group-hover/item:text-zinc-100 transition-colors">
                                {typeof step === 'string' ? step : step.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StepsBlock;
