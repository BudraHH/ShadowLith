function TextBlock({ children, className = "", isStreaming = false }) {
    if (!children && !isStreaming) return null;

    // Simple markdown-to-JSX formatter for bold, italic, and inline code
    const formatText = (text) => {
        if (typeof text !== 'string') return text;

        const parts = text.split(/(\*\*.*?\*\*|__.*?__|(\*|_).*?\2|`.*?`)/g);

        return parts.map((part, i) => {
            if (!part) return null;

            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('__') && part.endsWith('__')) {
                return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
                return <em key={i} className="italic">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    return (
        <p className={`text-zinc-300 leading-relaxed whitespace-pre-wrap ${className}`}>
            {formatText(children)}
            {isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500/50 animate-pulse align-middle" />}
        </p>
    );
}

export default TextBlock;
