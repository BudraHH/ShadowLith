import React from 'react';

const OptionBlock = ({ label, content }) => {
    return (
        <div className="relative group text-white">
            <div className="flex items-center gap-2 py-1 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                ⭐ Answer
            </div>
            <div className="flex items-start gap-3 text-white text-[16px] font-semibold leading-relaxed drop-shadow-md">
                <span className="text-amber-400">[{label}]</span>
                <span>{content}</span>
            </div>
        </div>
    );
};

export default OptionBlock;
