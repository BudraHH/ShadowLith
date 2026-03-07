import React, { useState } from 'react';
import { List } from 'lucide-react';

const StepsBlock = ({ steps }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!steps || !Array.isArray(steps)) return null;

    return (
        <div className="border-l-2 border-blue-500/40 bg-blue-500/5 rounded-r-md relative group my-4 text-[14px] text-white">
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 p-2 font-semibold"
            > Implementation Steps
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {(() => {
                        // Flatten steps mainly if Gemeni returned a single string block with newlines
                        let flatSteps = [];

                        steps.forEach(stepObj => {
                            const content = typeof stepObj === 'string' ? stepObj : stepObj.content;
                            // Check for numbered list format "1. ... \n 2. ..."
                            if (content.includes('\n') && /\d+\./.test(content)) {
                                const lines = content.split('\n');
                                lines.forEach(line => {
                                    const cleaned = line.trim();
                                    if (cleaned) {
                                        // Remove leading number like "1. " or "2."
                                        const text = cleaned.replace(/^\d+\.\s*/, '');
                                        if (text) flatSteps.push(text);
                                    }
                                });
                            } else {
                                flatSteps.push(content);
                            }
                        });


                        return flatSteps.map((stepText, idx) => (
                            <div key={idx} className="flex items-start gap-3 group/item">
                                {/* Circle Marker */}
                                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/50 flex items-center justify-center text-[10px] font-mono text-zinc-400 group-hover/item:border-blue-500/30 group-hover/item:text-blue-400 transition-all mt-0.5">
                                    {idx + 1}
                                </div>

                                {/* Text */}
                                <div className="text-zinc-300 text-[13px] leading-relaxed font-regular group-hover/item:text-zinc-100 transition-colors">
                                    {stepText}
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            )}
        </div>
    );
};

export default StepsBlock;
