import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ code, language = "python", className = "" }) {
    const [copied, setCopied] = useState(false);

    if (!code) return null;

    const handleCopy = async () => {
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
            {/* Header */}
            <div className={`flex items-center justify-between px-3 py-1.5 border-b bg-zinc-900/50 border-zinc-800`}>
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-zinc-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest select-none text-zinc-500">
                        {language}
                    </span>
                </div>
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
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="overflow-hidden bg-zinc-950">
                <SyntaxHighlighter
                    language={language.toLowerCase()}
                    style={vscDarkPlus}
                    className="thin-scrollbar"
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.75rem', // text-xs
                        lineHeight: '1.5',
                        fontFamily: 'monospace',
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    )
}

export default CodeBlock
