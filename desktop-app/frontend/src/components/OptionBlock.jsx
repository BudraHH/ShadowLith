import React from 'react';

const OptionBlock = ({ label, content }) => {
    return (
        <div className="flex flex-col justify-center items-start gap-3 p-3 my-1 border border-zinc-800 bg-zinc-900/10 rounded-md hover:bg-zinc-800/30 hover:border-zinc-700 transition-all cursor-pointer group">
            <div className="flex items-center font-regular text-zinc-300 pb-2 border-b border-zinc-500 w-full  group-hover:text-zinc-100 group-hover:border-zinc-500 transition-colors">
                Option {label || '•'}
            </div>
            <div className="text-zinc-300 group-hover:text-zinc-200 transition-colors">{content}</div>
        </div>
    );
};

export default OptionBlock;
