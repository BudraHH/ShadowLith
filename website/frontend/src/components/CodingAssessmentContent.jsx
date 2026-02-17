import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    Code2, RotateCw, Shield, MoreVertical, ChevronLeft,
    Terminal, Play, Send, Settings, Info, List, Clock, ChevronDown
} from 'lucide-react';

import { SCENARIO_QUESTIONS } from '../utils/scenarioQuestions';

const CodingAssessmentContent = ({ view }) => {
    const data = SCENARIO_QUESTIONS.Coding;
    const [isOpen, setIsOpen] = useState(false);
    const activeQuestion = 1;

    const questions = data.questions;
    const snippets = data.snippets;

    return (
        <motion.div
            key="assessment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col bg-[#020202] font-sans overflow-hidden"
        >
            {/* TOP UTILITY BAR (Stealth Theme) */}
            <div className="h-12 bg-[#080808] border-b border-zinc-900/50 flex items-center justify-between px-6 shrink-0 relative z-40">
                <div className="flex items-center gap-6 h-full text-[11px] font-bold tracking-tight text-zinc-400">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <ChevronLeft size={14} />
                        <span className="font-mono text-emerald-500 opacity-80 uppercase tracking-widest">{data.taskInfo}</span>
                    </div>

                    <div className="h-4 w-px bg-zinc-800" />

                    {/* Question Indicators */}
                    <div className="flex items-center gap-2">
                        {questions.map((q) => (
                            <div
                                key={q.id}
                                className={`cursor-pointer w-7 h-7 rounded flex items-center justify-center text-[10px] font-semibold tracking-tighter transition-all border ${q.id === activeQuestion
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                                    : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-700 hover:text-white hover:bg-zinc-600/50'
                                    }`}
                            >
                                Q{q.id}
                            </div>
                        ))}
                    </div>

                    <div className="h-4 w-px bg-zinc-800" />

                    <div className="flex items-center gap-2 border-b-2 border-emerald-500 h-full px-2 text-white cursor-pointer">
                        {data.questions.find(q => q.id === activeQuestion)?.title}
                    </div>
                    <div className="flex items-center gap-2 opacity-40 hover:opacity-100 cursor-pointer transition-opacity">
                        <Clock size={12} /> 1:12:34
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-mono tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" /> CLOUD_SYNC_ON
                    </div>
                    <Settings size={14} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT PANE: PROBLEM STATEMENT (Darker Stealth Theme) */}
                <div className="w-[40%] flex flex-col bg-[#050505] border-r border-zinc-900/80">
                    <div className="h-10 bg-[#080808] border-b border-zinc-900/50 flex items-center px-4 gap-4 shrink-0">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Task_Description</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Test_Cases</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">{data.title}</h2>
                        </div>

                        <div className="text-[12px] leading-relaxed text-zinc-400 space-y-6">
                            <div className="whitespace-pre-wrap">{data.problem}</div>

                            <div className="space-y-8 pt-4">
                                {data.examples.map((ex, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-200 font-black text-[10px] uppercase tracking-widest">
                                            <List size={12} className="text-emerald-500" />
                                            <span>Example_{ex.id || (idx + 1).toString().padStart(2, '0')}</span>
                                        </div>
                                        <div className="bg-black/40 p-4 rounded-xl font-mono text-[11px] text-zinc-400 border border-zinc-900/50 space-y-1">
                                            <div className="text-zinc-500">// Input</div>
                                            <div className="text-emerald-500/80">{ex.input}</div>
                                            <div className="pt-2 text-zinc-500">// Output</div>
                                            <div className="text-white font-bold">{ex.output}</div>
                                            {ex.explanation && (
                                                <div className="pt-2 text-zinc-500 italic text-[10px]">
                                                    <span className="not-italic font-bold text-zinc-600">Explanation: </span>
                                                    {ex.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Constraints */}
                                <div className="space-y-4 pt-4 border-t border-zinc-900">
                                    <div className="flex items-center gap-2 text-zinc-200 font-black text-[10px] uppercase tracking-widest">
                                        <Info size={12} className="text-emerald-500" />
                                        <span>Problem_Constraints</span>
                                    </div>
                                    <ul className="list-disc pl-5 space-y-2 text-[11px] text-zinc-500 font-medium">
                                        {data.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: EDITOR & COMPILER */}
                <div className="flex-1 flex flex-col relative bg-[#020202]">

                    {/* EDITOR HEADER */}
                    <div className="h-10 bg-[#080808] border-b border-zinc-900 flex items-center justify-between px-4 shrink-0 relative z-50">
                        <div className="flex items-center gap-3">
                            <div
                                className="bg-zinc-900/80 hover:bg-zinc-800 px-3 py-1 rounded text-[10px] text-zinc-200 font-bold cursor-pointer transition-all flex items-center gap-2 border border-zinc-800 focus:outline-none"
                            >
                                {"Python 3"} <ChevronDown size={10} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-600">
                            <RotateCw size={12} className="hover:text-emerald-500 cursor-pointer transition-colors" />
                            <div className="h-3 w-px bg-zinc-800" />
                            <Code2 size={12} className="hover:text-emerald-500 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {/* CODE SURFACE */}
                    <div className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#020202]">
                        <SyntaxHighlighter
                            language={"python"}
                            style={vscDarkPlus}
                            showLineNumbers={true}
                            lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#3f3f46', borderRight: '1px solid #18181b', marginRight: '1em', textAlign: 'right' }}
                            customStyle={{
                                margin: 0,
                                padding: '2rem',
                                background: 'transparent',
                                fontSize: '13px',
                                lineHeight: '1.6',
                                height: '100%',
                            }}
                        >
                            {`class Solution:
    def findOrder(self, numCourses: int, pre: List[List[int]]) -> List[int]:
        # Build adjacency list & in-degree array
        adj = [[] for _ in range(numCourses)]
        in_degree = [0] * numCourses

        for a, b in pre:
            adj[b].append(a)
            in_degree[a] += 1

        # Initialize queue with zero in-degree nodes
        queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
        order = []

        while queue:
            node = queue.popleft()
            order.append(node)
            for nei in adj[node]:`}
                        </SyntaxHighlighter>


                    </div>

                    {/* COMPILER FOOTER */}
                    <div className="h-14 bg-[#080808] border-t border-zinc-900 flex items-center justify-between px-6">
                        <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors group">
                                <Terminal size={12} className="group-hover:text-emerald-500 transition-colors" /> Custom_Input
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-[11px] font-black uppercase tracking-widest rounded cursor-pointer transition-all flex items-center gap-2">
                                <Play size={10} fill="currentColor" /> Run Code
                            </button>
                            <button className="px-7 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded transition-all cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.2)] flex items-center gap-2">
                                <Send size={10} /> Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CodingAssessmentContent;
