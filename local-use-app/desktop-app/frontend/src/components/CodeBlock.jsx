import { useState } from 'react';
import { Copy, Check, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ code, language = "python", className = "", isStreaming = false }) {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    if (!code && !isStreaming) return null;

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            // Check if we are in pywebview environment. 
            // The modern navigator.clipboard API triggers a 'Feature Permission' request 
            // in the Qt backend which currently has a bug that crashes the Python process.
            const useStealthCopy = !!window.pywebview;

            if (navigator.clipboard && navigator.clipboard.writeText && !useStealthCopy) {
                await navigator.clipboard.writeText(code);
            } else {
                // Stealth Fallback: Uses a hidden textarea to bypass modern permission prompts
                const textarea = document.createElement("textarea");
                textarea.value = code;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                textarea.style.top = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                if (!successful) throw new Error("Stealth Copy failed");
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <div
            onMouseDown={(e) => e.stopPropagation()}
            className={`group relative bg-black/50 border border-zinc-800 rounded-lg overflow-hidden my-2 ${className}`}
        >
            {/* Header / Click to Toggle */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center justify-between px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest select-none text-white">
                        {language} code {isStreaming && <span className="text-emerald-500 animate-pulse ml-2">• Streaming</span>}
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
                <div className="overflow-hidden bg-black/50 select-text">
                   <SyntaxHighlighter
                            language={language.toLowerCase()}
                            style={vscDarkPlus}
                            className="thin-scrollbar"
                            customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: 'transparent',
                                fontSize: '1rem',
                                lineHeight: '1.2',
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
