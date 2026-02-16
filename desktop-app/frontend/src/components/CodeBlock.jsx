import { useState } from 'react';
import { Copy, Check, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ code, language = "python", className = "" }) {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    if (!code) return null;

    const handleCopy = async (e) => {
        e.stopPropagation(); // Don't collapse when clicking copy
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <div className={`group relative bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden my-2 transition-all duration-200 ${className}`}>
            {/* Header / Click to Toggle */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center justify-between px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors`}
            >
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-zinc-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest select-none text-zinc-500">
                        {language}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-[10px] font-medium transition-colors uppercase tracking-wider outline-none hover:cursor-pointer text-zinc-500 hover:text-zinc-300"
                    >
                        {copied ? (
                            <>
                                <Check size={12} className="text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy size={12} />
                                <span className="text-zinc-500 hover:text-zinc-300 transition-colors">Copy</span>
                            </>
                        )}
                    </button>
                    <div className="text-zinc-600">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="overflow-hidden bg-zinc-950">
                    <SyntaxHighlighter
                        language={language.toLowerCase()}
                        style={vscDarkPlus}
                        className="thin-scrollbar"
                        customStyle={{
                            margin: 0,
                            padding: '1rem',
                            background: 'transparent',
                            fontSize: '0.8rem',
                            lineHeight: '1.5',
                            fontFamily: 'monospace',
                        }}
                        wrapLines={true}
                        wrapLongLines={true}
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    )
}

export default CodeBlock
