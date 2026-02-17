
import React, { useState, useEffect, useRef } from "react";
import {
    ChevronRight, Trash2, Send, Zap, X, GripHorizontal, Loader2, Minimize2,
    Terminal, MessageSquare, BookOpen, Sparkles, Camera, Mic, MonitorPlay,
    ChevronLeft, ChevronDown, ChevronUp, Ghost, Activity, Search, History,
    User, List, Clock, Database, BarChart3, Copy, Check, ArrowUpDown, Bot
} from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SCENARIO_UI_DATA } from "../utils/scenarioUiData";
import { SCENARIO_QUESTIONS } from "../utils/scenarioQuestions";
import Typed from 'typed.js';

// --- PRIMITIVES ---
const Button = ({ children, onClick, disabled = false, className = '', variant = 'primary', ...rest }) => {
    const variants = {
        primary: "bg-zinc-100 text-zinc-950 border border-zinc-100 hover:bg-white active:bg-zinc-200",
        secondary: "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 active:bg-zinc-900",
        outline: "bg-transparent text-zinc-300 border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-700",
        danger: "bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-950/40 active:bg-red-950/50",
        ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
        none: ""
    }
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                px-3 py-1.5 text-xs font-semibold rounded-md 
                cursor-pointer transition-colors duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed
                outline-none focus:ring-2 focus:ring-zinc-500/20
                ${variants[variant] || variants.none}
                ${className}
            `}
            {...rest}
        >
            {children}
        </button>
    )
};

const Select = ({ value, onChange, options, placeholder = "Select" }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="flex items-center justify-between gap-2 bg-zinc-950/50 border border-zinc-800 hover:bg-zinc-800/50 hover:text-zinc-100 rounded-md py-1 px-2 text-[10px] text-zinc-400 focus:outline-none focus:border-zinc-700 transition-all w-[90px]"
            >
                <span>{value || placeholder}</span>
                <ChevronDown size={12} className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`z-[100] absolute top-full right-0 mt-1 w-[100px] bg-[#0A0A0A] border border-zinc-800 rounded-md shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="p-1 flex flex-col gap-0.5">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`flex items-center justify-between px-2 py-1.5 rounded text-[10px] cursor-pointer transition-colors ${value === option ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
                        >
                            <span>{option}</span>
                            {value === option && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- BLOCK COMPONENTS ---
const TextBlock = ({ children, className = "" }) => (
    children ? <p className={`text-zinc-300 leading-relaxed whitespace-pre-wrap ${className}`}>{children}</p> : null
);

const CodeBlock = ({ code, language = "python", className = "" }) => {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    if (!code) return null;
    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { console.error('Failed to copy!', err); }
    };

    return (
        <div className={`group relative bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden my-2 transition-all duration-200 ${className}`}>
            <div onClick={() => setIsExpanded(!isExpanded)} className={`flex items-center justify-between px-3 py-2 bg-zinc-900/50 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors`}>
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-zinc-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest select-none text-zinc-500">{language}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] font-medium transition-colors uppercase tracking-wider outline-none hover:cursor-pointer text-zinc-500 hover:text-zinc-300">
                        {copied ? <><Check size={12} className="text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><Copy size={12} /><span className="text-zinc-500 hover:text-zinc-300 transition-colors">Copy</span></>}
                    </button>
                    <div className="text-zinc-600">{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                </div>
            </div>
            {isExpanded && (
                <div className="overflow-hidden bg-zinc-950">
                    <SyntaxHighlighter language={language.toLowerCase()} style={vscDarkPlus} className="thin-scrollbar text-[10px]" customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '10px', lineHeight: '1.5', fontFamily: 'monospace' }} wrapLines={true} wrapLongLines={true}>{code}</SyntaxHighlighter>
                </div>
            )}
        </div>
    )
}

const AnalysisBlock = ({ time, space, complexityLabel = "Performance Metrics" }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border-l-2 border-zinc-500/40 bg-zinc-500/5 rounded-r-md relative group my-2">
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 p-3 text-zinc-400 text-[10px] font-bold uppercase tracking-widest opacity-70 hover:bg-zinc-500/10 transition-colors cursor-pointer">
                <BarChart3 size={12} /> {complexityLabel}
            </div>
            {isExpanded && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-6 py-2 px-4 bg-zinc-950/50 border border-zinc-800/50 rounded-md w-max">
                        <div className="flex items-center gap-2"><Clock size={12} className="text-zinc-500" /><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Time</span><span className="text-sm font-mono text-emerald-500 ml-1">{time || "N/A"}</span></div>
                        <div className="w-px h-3 bg-zinc-800" />
                        <div className="flex items-center gap-2"><Database size={12} className="text-zinc-500" /><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Space</span><span className="text-sm font-mono text-blue-500 ml-1">{space || "N/A"}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const OptionBlock = ({ label, content }) => (
    <div className="flex flex-col justify-center items-start gap-3 p-3 my-1 border border-zinc-800 bg-zinc-900/10 rounded-md hover:bg-zinc-800/30 hover:border-zinc-700 text-[10px] transition-all cursor-pointer group">
        <div className="flex items-center font-regular text-zinc-300 pb-2 border-b border-zinc-500 w-full group-hover:text-zinc-100 group-hover:border-zinc-500 transition-colors">Option {label || '•'}</div>
        <div className="text-zinc-300 group-hover:text-zinc-200 transition-colors">{content}</div>
    </div>
);

const QuestionBlock = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border-l-2 border-amber-500/40 bg-amber-500/5 rounded-r-md relative group">
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 p-4 text-amber-400 text-[12px] font-bold uppercase tracking-widest opacity-70 hover:bg-amber-500/10 transition-colors cursor-pointer"><MessageSquare size={12} /> Interviewer Question</div>
            {isExpanded && <div className="px-4 pb-4 text-zinc-300 text-[12px] leading-relaxed italic">{content}</div>}
        </div>
    );
};

const ProblemBlock = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border-l-2 border-rose-500/40 bg-rose-500/5 rounded-r-md relative group">
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 p-4 text-rose-400 text-[12px] font-bold uppercase tracking-widest opacity-70 hover:bg-rose-500/10 transition-colors cursor-pointer"><Search size={12} /> Problem Analysis</div>
            {isExpanded && <div className="px-4 pb-4 text-zinc-300 text-[12px] leading-relaxed">{content}</div>}
        </div>
    );
};

const StrategyBlock = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border-l-2 border-emerald-500/40 bg-emerald-500/5 rounded-r-md relative group">
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 p-4 text-emerald-400 text-[12px] font-bold uppercase tracking-widest opacity-70 hover:bg-emerald-500/10 transition-colors cursor-pointer"><Zap size={12} /> Solution Strategy</div>
            {isExpanded && <div className="px-4 pb-4 text-zinc-300 text-[12px] leading-relaxed">{content}</div>}
        </div>
    );
};

const ReasoningBlock = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="border-l-2 border-indigo-500/40 bg-indigo-500/5 rounded-r-md relative group">
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 p-4 text-indigo-400 text-[12px] font-bold uppercase tracking-widest opacity-70 hover:bg-indigo-500/10 transition-colors cursor-pointer"><Sparkles size={12} /> Logical Reasoning</div>
            {isExpanded && <div className="px-4 pb-4 text-zinc-300 text-[12px] leading-relaxed italic">{content}</div>}
        </div>
    );
};

const InterviewBlock = ({ content }) => (
    <div className="my-5 p-4 border-l-2 border-blue-500/40 bg-blue-500/5 rounded-r-md relative group">
        <div className="flex items-center gap-2 text-blue-400 text-[12px] font-bold uppercase tracking-widest mb-3 opacity-70"><MessageSquare size={12} /> Talking Points</div>
        <div className="text-zinc-100/80 text-[12px] leading-relaxed font-regular">"{content}"</div>
    </div>
);

const StepsBlock = ({ steps }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    if (!steps || !Array.isArray(steps)) return null;
    return (
        <div className="border-l-2 border-blue-500/40 bg-blue-500/5 rounded-r-md relative group my-4">
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 p-4 text-blue-400 text-[10px] font-bold uppercase tracking-widest opacity-70 hover:bg-blue-500/10 transition-colors cursor-pointer"><List size={12} /> Implementation Steps</div>
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {steps.map((stepObj, idx) => {
                        const content = typeof stepObj === 'string' ? stepObj : stepObj.content;
                        return (
                            <div key={idx} className="flex items-start gap-3 group/item">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/50 flex items-center justify-center text-[10px] font-mono text-zinc-400 group-hover/item:border-blue-500/30 group-hover/item:text-blue-400 transition-all mt-0.5">{idx + 1}</div>
                                <div className="text-zinc-300 text-[10px] leading-relaxed font-regular group-hover/item:text-zinc-100 transition-colors">{content}</div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

// --- PANELS ---
const ExplanationPanel = ({ showExplanation, setShowExplanation, showAnswer, showChat, explanationData, renderBlocks, renderHeaderBadges, isProcessing, question, mode }) => {
    const [isReversed, setIsReversed] = useState(false);
    const onlyExplanation = !showAnswer && !showChat;
    const blocksToRender = explanationData?.blocks
        ? (isReversed ? [...explanationData.blocks].reverse() : explanationData.blocks)
        : [];

    return (
        <div className={`flex flex-col h-full transition-all border border-zinc-800/80 duration-300 ${showExplanation ? 'w-full' : 'w-12 shrink-0 pointer-events-auto'} bg-[#030303] rounded-md overflow-hidden min-w-0`}>
            <div className={`flex items-center ${showExplanation ? 'justify-between' : 'justify-center'} p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors`} onClick={() => setShowExplanation(!showExplanation)}>
                <div className="flex items-center gap-2 text-zinc-400">
                    <BookOpen size={16} className={showExplanation ? "text-zinc-500" : "text-zinc-300"} />
                    {showExplanation && <span className="font-semibold uppercase text-xs text-zinc-300">Explanation</span>}
                </div>
                {showExplanation && (
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsReversed(!isReversed); }} className="text-zinc-600 hover:text-zinc-300 transition-colors" title="Reverse Order"><ArrowUpDown size={14} /></button>
                        <ChevronLeft className={`w-4 h-4 text-zinc-600 hover:text-zinc-300 transition-colors`} />
                    </div>
                )}
            </div>
            {showExplanation && (
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6 thin-scrollbar">
                    {/* Render Question/Problem if provided */}

                    {explanationData ? (
                        <>

                            {renderHeaderBadges(explanationData)}
                            {question && (
                                <div className="mb-4 space-y-4">
                                    {(question.problem || question.question) && (
                                        mode === "Interview"
                                            ? <QuestionBlock content={question.problem || question.question} />
                                            : <ProblemBlock content={question.problem || question.question} />
                                    )}
                                </div>
                            )}
                            {renderBlocks(blocksToRender)}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600">
                            {isProcessing ? <div className="text-center animate-pulse"><p className="font-semibold text-zinc-400">Thinking...</p><p className="text-xs opacity-80">Analyzing context</p></div> : <div className="text-center space-y-1 select-none"><p className="text-zinc-400 font-medium text-xs">No explanations yet</p></div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SolutionPanel = ({ mode, showAnswer, setShowAnswer, showExplanation, showChat, data, renderBlocks, renderHeaderBadges, isProcessing, question }) => {
    const onlyAnswer = !showExplanation && !showChat;
    return (
        <div className={`flex flex-col transition-all border border-zinc-800/80 duration-300 ${showAnswer ? 'w-full' : 'w-12 shrink-0 pointer-events-auto'} bg-[#030303] rounded-md overflow-hidden min-w-0`}>
            <div className={`flex items-center ${showAnswer ? 'justify-between' : 'justify-center'} p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors`} onClick={() => setShowAnswer(!showAnswer)}>
                <div className="flex items-center gap-2 text-emerald-500/90">
                    <Sparkles size={16} className={showAnswer ? "text-emerald-500/90" : "text-emerald-400"} />
                    {showAnswer && <span className="font-semibold uppercase text-xs">Solution</span>}
                </div>
                {showAnswer && <ChevronLeft className="w-4 h-4 text-emerald-900 hover:text-emerald-500 transition-colors" />}
            </div>
            {showAnswer && (
                <div className={`flex-1 ${mode !== "MCQ" ? "overflow-y-auto" : ""} p-4 space-y-6 thin-scrollbar`}>
                    {/* Render MCQ Question if provided */}
                    {question && (
                        <div className="mb-2 space-y-4">
                            <div className="space-y-2">
                                {question.options?.filter(opt => !question.correctAnswer || opt.label === question.correctAnswer).map((opt, i) => (
                                    <OptionBlock key={i} label={opt.label} content={opt.content} />
                                ))}
                            </div>
                        </div>
                    )}
                    {data && !question?.correctAnswer ? (
                        <>
                            {renderHeaderBadges(data)}
                            {renderBlocks(data.blocks)}
                        </>
                    ) : <div className="flex items-center justify-center h-full text-zinc-600">

                        {mode !== "MCQ" && (
                            isProcessing ? <div className="text-center animate-pulse"><p className="font-semibold text-zinc-400">Thinking...</p><p className="text-xs opacity-80">Analyzing context</p></div> : <div className="text-center space-y-1 select-none"><p className="text-zinc-400 font-medium text-xs">No solutions yet</p></div>)}
                    </div>}
                </div>
            )}
        </div>
    );
};

const ChatWindow = ({ messages, setMessages, isListening, setIsListening, setShowAnswer,
    setShowExplanation, setShowChat, setShowEmptyAnswer, setShowEmptyExplanation, setIsThinking, isThinking,
    question, showExplanation, showAnswer, showChat, hasTriggeredInterview, setHasTriggeredInterview, onInterviewHudComplete, hasCompletedInterview }) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const typedRef = useRef(null);

    useEffect(() => {
        if (!hasCompletedInterview && isListening && question?.problem) {
            // Clear existing input
            setInput("");

            // Custom typing to keep React state in sync for textarea
            let currentStr = "";
            let charIdx = 0;
            const targetStr = question.problem;

            const interval = setInterval(() => {
                if (charIdx < targetStr.length) {
                    currentStr += targetStr[charIdx];
                    setInput(currentStr);
                    charIdx++;
                } else {
                    clearInterval(interval);

                    // ON FINISHED:
                    setTimeout(() => {
                        const finalMsg = targetStr;
                        setInput("");
                        setMessages(prev => [...prev, { role: "user", content: "The interviewer's question is: \n\n" + finalMsg }]);

                        setTimeout(() => {
                            setShowChat(true);
                            setShowExplanation(true);
                            setShowAnswer(true);
                            setIsListening(false);
                            setIsThinking(true);

                            setTimeout(() => {
                                setIsThinking(false);
                                setShowEmptyExplanation(false);
                                setShowEmptyAnswer(false);
                                setMessages(prev => [...prev, {
                                    role: "assistant", content: [{ type: 'text', content: "Good, let's see your answer. I have given a detailed analysis of the Query and provided a solution." }]
                                }]);

                            }, 1000);
                        }, 1000);
                    }, 1000);

                    setHasTriggeredInterview(true);
                    if (onInterviewHudComplete) onInterviewHudComplete();
                }
            }, 25);

            return () => clearInterval(interval);
        }
    }, [isListening, question]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: "user", content: input.trim() }]);
        setInput("");
        // Simple mock response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", content: [{ type: 'text', content: "This is a mockup response. In the live app, I would analyze your code or provide interview tips based on our conversation." }] }]);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 thin-scrollbar bg-zinc-950/30">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-md text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 px-3 py-2 max-w-[85%]' : 'bg-transparent text-zinc-300 w-full'}`}>
                            {Array.isArray(msg.content) ? (
                                <div className="flex flex-col gap-2">
                                    {msg.content.map((block, bIdx) => (
                                        block.type === 'code' ? <CodeBlock key={bIdx} code={block.content} language={block.lang} /> : <div key={bIdx} className="bg-zinc-800/50 border border-zinc-700/50 rounded-md px-3 py-2 whitespace-pre-wrap">{block.content}</div>
                                    ))}
                                </div>
                            ) : <span className="whitespace-pre-wrap">{msg.content}</span>}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start ml-1">
                        <div className="flex items-center gap-1 bg-zinc-800/40 border border-zinc-700/40 rounded-md px-3 py-4 w-fit">
                            <div className="w-1 h-1 bg-zinc-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-zinc-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-zinc-200 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex items-end gap-2">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-zinc-950/50 thin-scrollbar scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600 resize-none min-h-[38px] max-h-[110px]" rows={((!showAnswer && !showExplanation) ? 2 : (!showAnswer && showExplanation && showChat) || (showAnswer && !showExplanation && showChat)) ? 3 : 1} />
                    <Button variant={input.trim() ? "primary" : "secondary"} onClick={handleSend} disabled={!input.trim()}><Send size={14} /></Button>
                </div>
            </div>
        </div>
    );
};

const ChatPanel = ({ showChat, setShowChat, showExplanation, showAnswer, messages, setMessages, isThinking, isListening, setIsListening, question, setShowAnswer, setShowExplanation, setShowEmptyAnswer, setShowEmptyExplanation, setIsThinking, hasTriggeredInterview, setHasTriggeredInterview, onInterviewHudComplete, hasCompletedInterview }) => {
    const onlyChat = !showExplanation && !showAnswer;
    return (
        <div className={`flex flex-col border border-zinc-800/80 transition-all duration-300 ${showChat ? 'w-full' : 'w-12 shrink-0'} bg-[#030303] rounded-md overflow-hidden min-w-0`}>
            <div className={`flex items-center ${showChat ? 'justify-between' : 'justify-center'} p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors`} onClick={() => setShowChat(!showChat)}>
                <div className="flex items-center gap-2 text-slate-400">
                    <MessageSquare size={16} />
                    {showChat && <span className="font-semibold uppercase text-xs">Chat</span>}
                </div>
                {showChat && <ChevronLeft className="w-4 h-4 text-slate-500 hover:text-slate-500 transition-colors" />}
            </div>
            {showChat && <div className="flex-1 overflow-hidden h-full"><ChatWindow messages={messages} setMessages={setMessages} isListening={isListening} setIsListening={setIsListening} question={question} showExplanation={showExplanation} showAnswer={showAnswer} showChat={showChat} isThinking={isThinking} setShowAnswer={setShowAnswer} setShowExplanation={setShowExplanation} setShowChat={setShowChat} setShowEmptyAnswer={setShowEmptyAnswer} setShowEmptyExplanation={setShowEmptyExplanation} setIsThinking={setIsThinking} hasTriggeredInterview={hasTriggeredInterview} setHasTriggeredInterview={setHasTriggeredInterview} onInterviewHudComplete={onInterviewHudComplete} hasCompletedInterview={hasCompletedInterview} /></div>}
        </div>
    );
};

// --- MAIN LAYOUT ---
export default function ActualUiMockup({ mode, setMode, onInterviewHudComplete, setShowQuery, hasTriggeredInterview, setHasTriggeredInterview, hasCompletedInterview }) {
    const [showExplanation, setShowExplanation] = useState(true);
    const [showAnswer, setShowAnswer] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showEmptyExplanation, setShowEmptyExplanation] = useState(false);
    const [showEmptyAnswer, setShowEmptyAnswer] = useState(false);

    // Use split data structures
    const activeData = SCENARIO_UI_DATA[mode] || SCENARIO_UI_DATA.Coding;
    const activeQuestion = SCENARIO_QUESTIONS[mode] || SCENARIO_QUESTIONS.Coding;
    const historyIndex = 0; // Fixed index since it's driven per mode now
    const historyLength = 1;

    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState("Java");
    const [isProcessing, setIsProcessing] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: "assistant", content: [{ type: 'text', content: "I’m here to support you through this assessment. How can I help?" }] }
    ]);
    const data = activeData.data;
    const explanationData = activeData.explanationData;

    useEffect(() => {
        if (mode === "Interview") {
            if (!hasTriggeredInterview) {
                setHasTriggeredInterview(true);
                setShowEmptyExplanation(true);
                setShowEmptyAnswer(true);
                setTimeout(() => {
                    setIsListening(true);
                    setShowAnswer(false);
                    setShowExplanation(false);
                    setShowChat(true);
                }, 2000);
            } else if (hasCompletedInterview) {
                // Simulation already finished, restore the end state
                setIsListening(false);
                setIsProcessing(false);
                setShowExplanation(true);
                setShowAnswer(true);
                setShowEmptyExplanation(false);
                setShowEmptyAnswer(false);
                setShowChat(true);
                setChatMessages([
                    { role: "assistant", content: [{ type: 'text', content: "I’m here to support you through this assessment. How can I help?" }] },
                    { role: "user", content: "The interviewer's question is: \n\n" + activeQuestion.problem },
                    { role: "assistant", content: [{ type: 'text', content: "Good, let's see your answer. I have given a detailed analysis of the Query and provided a solution." }] }
                ]);
                setShowQuery(true);
            }
        } else {
            // Reset for Coding or MCQ
            setIsListening(false);
            setIsProcessing(false);
            setShowExplanation(true);
            setShowAnswer(true);
            setShowEmptyExplanation(false);
            setShowEmptyAnswer(false);
            setShowChat(false);
            setChatMessages([
                { role: "assistant", content: [{ type: 'text', content: "I’m here to support you through this assessment. How can I help?" }] }
            ]);
        }
    }, [mode, hasTriggeredInterview]);

    const renderBlocks = (blocks) => {
        if (!blocks || !Array.isArray(blocks)) return null;

        const processedBlocks = [];
        let currentSteps = [];

        blocks.forEach((block) => {
            if (block.type === 'step') {
                currentSteps.push(block);
            } else {
                if (currentSteps.length > 0) {
                    processedBlocks.push({ type: 'steps_group', steps: currentSteps });
                    currentSteps = [];
                }
                processedBlocks.push(block);
            }
        });

        if (currentSteps.length > 0) {
            processedBlocks.push({ type: 'steps_group', steps: currentSteps });
        }

        return processedBlocks.map((block, idx) => {
            // Filter out interview content if we're in Coding or MCQ mode
            if (block.type === 'interview' && mode !== 'Interview') return null;

            switch (block.type) {
                case 'text': return <TextBlock key={idx}>{block.content}</TextBlock>;
                case 'code': return <CodeBlock key={idx} code={block.content} language={block.lang} />;
                case 'option': return <OptionBlock key={idx} label={block.label} content={block.content} />;
                case 'analysis': return <AnalysisBlock key={idx} time={block.time} space={block.space} complexityLabel={block.label} />;
                case 'interview': return <InterviewBlock key={idx} content={block.content} />;
                case 'problem': return <ProblemBlock key={idx} content={block.content} />;
                case 'strategy': return <StrategyBlock key={idx} content={block.content} />;
                case 'steps_group': return <StepsBlock key={idx} steps={block.steps} />;
                case 'reasoning': return <ReasoningBlock key={idx} content={block.content} />;
                default: return null;
            }
        });
    };


    const renderHeaderBadges = (item) => (
        item?.summary && (
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-wider">{item.summary}</span>
            </div>
        )
    );

    return (
        <div className="flex flex-col gap-2 h-[700px] bg-transparent overflow-hidden w-full font-sans">
            {/* TOP CONTROL BAR */}
            <div className="flex flex-row justify-between items-center p-2 w-full bg-[#030303] rounded-md select-none border border-zinc-800/80">
                <div className="flex items-center gap-3 pl-2">
                    <h1 className="text-sm font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">SHADOWLITH</h1>
                    <div className="flex items-center gap-2 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-700/50">
                        <button className="text-zinc-600 cursor-default"><ChevronLeft size={12} /></button>
                        <span className="text-[10px] font-mono text-zinc-500">v{historyIndex + 1}/{historyLength}</span>
                        <button className="text-zinc-600 cursor-default"><ChevronRight size={12} /></button>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <div className="flex items-center bg-zinc-950/50 border border-zinc-800 rounded-md p-0.5">
                        {["Assessment", "Interview"].map((m) => {
                            const isActive = m === 'Assessment' ? (mode === 'Coding' || mode === 'MCQ') : mode === 'Interview';
                            return (
                                <button
                                    key={m}
                                    onClick={() => setMode(m === 'Assessment' ? 'Coding' : 'Interview')}
                                    className={`px-2 py-1 text-[10px] rounded-[4px] transition-all ${isActive ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>
                    <div className="border border-zinc-800/80 text-[10px] p-2 rounded-md flex items-center text-zinc-300"> Python 3 <ChevronDown size={12} /></div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-row justify-between items-center border border-zinc-800/80 p-2 w-full bg-[#030303] rounded-md select-none">
                <div className="flex flex-row items-center gap-1">
                    <Button variant="ghost" className="flex items-center gap-1.5 px-2 text-zinc-400 hover:text-zinc-100"><Camera size={14} className="mr-1.5" /> Capture</Button>
                    {mode === 'Interview' && (
                        <Button onClick={() => setIsListening(!isListening)} variant="ghost" className={`flex items-center gap-1.5 px-2 ${isListening ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`}>
                            <Mic size={14} className={`${isListening ? 'text-red-400' : 'text-zinc-400'}`} /> {isListening ? "Listening..." : "Listen"}
                        </Button>
                    )}
                    <Button variant="ghost" className="flex items-center gap-1.5 px-2 text-zinc-400 hover:text-purple-400"><MonitorPlay size={14} className="mr-1.5" /> Analyse</Button>
                    <Button variant="ghost" className="flex items-center gap-1.5 px-2 text-zinc-400 hover:text-yellow-400"><Trash2 size={14} className="mr-1.5" /> Clear</Button>
                    <Button variant="ghost" className={`flex items-center gap-1.5 px-2 text-zinc-400 hover:text-emerald-400 ${isProcessing ? 'text-zinc-600' : ''}`}>
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="mr-1.5" />} Process
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-row h-full gap-2 text-sm overflow-hidden ">
                <ExplanationPanel
                    showExplanation={showExplanation} setShowExplanation={setShowExplanation}
                    showAnswer={showAnswer} showChat={showChat}
                    explanationData={showEmptyExplanation ? null : explanationData}
                    question={activeQuestion}
                    renderBlocks={renderBlocks} renderHeaderBadges={renderHeaderBadges}
                    isProcessing={isProcessing}
                    mode={mode}
                />
                <SolutionPanel mode={mode}
                    showAnswer={showAnswer} setShowAnswer={setShowAnswer}
                    showExplanation={showExplanation}
                    showChat={showChat}
                    data={showEmptyAnswer ? null : data}
                    question={(mode === 'MCQ') ? activeQuestion : null}
                    renderBlocks={renderBlocks} renderHeaderBadges={renderHeaderBadges}
                    isProcessing={isProcessing}
                />
                <ChatPanel
                    showChat={showChat} setShowChat={setShowChat}
                    showExplanation={showExplanation} showAnswer={showAnswer}
                    messages={chatMessages} setMessages={setChatMessages}
                    isListening={isListening}
                    setIsListening={setIsListening}
                    question={activeQuestion}
                    setShowAnswer={setShowAnswer}
                    setShowExplanation={setShowExplanation}
                    setShowEmptyAnswer={setShowEmptyAnswer}
                    setShowEmptyExplanation={setShowEmptyExplanation}
                    isThinking={isProcessing}
                    setIsThinking={setIsProcessing}
                    hasTriggeredInterview={hasTriggeredInterview}
                    setHasTriggeredInterview={setHasTriggeredInterview}
                    onInterviewHudComplete={onInterviewHudComplete}
                    hasCompletedInterview={hasCompletedInterview}
                />
            </div>
        </div>
    );
}

