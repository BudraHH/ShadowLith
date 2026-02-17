import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, Send, Settings, Info, List, Clock, ChevronLeft,
    CheckCircle2, HelpCircle, ShieldAlert, Cpu, Check, Flag
} from 'lucide-react';

import { SCENARIO_QUESTIONS } from '../utils/scenarioQuestions';

const MCQAssessmentContent = ({ view }) => {
    const data = SCENARIO_QUESTIONS.MCQ;
    const [selectedOption, setSelectedOption] = useState(null);
    const activeQuestion = data.activeQuestion;
    const questions = data.questions;

    // Use labels and content from data.options
    const options = data.options.map(opt => ({
        id: opt.label,
        text: opt.content
    }));

    return (
        <motion.div
            key="mcq-assessment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col bg-[#020202] font-sans overflow-hidden"
        >
            {/* TOP UTILITY BAR */}
            <div className="h-12 bg-[#080808] border-b border-zinc-900/50 flex items-center justify-between px-6 shrink-0 relative z-40">
                <div className="flex items-center gap-6 h-full text-[11px] font-bold tracking-tight text-zinc-400">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <ChevronLeft size={14} />
                        <span className="font-mono text-emerald-500 opacity-80 uppercase tracking-widest">Section: {data.section}</span>
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

                    <div className="flex items-center gap-2 opacity-40">
                        <Clock size={12} /> <span className="font-mono">{data.timer}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-mono tracking-widest">
                        <ShieldAlert size={12} className="text-emerald-500" /> ENCLAVE_SECURED
                    </div>
                    <Settings size={14} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden">

                {/* QUESTION PANE */}
                <div className="w-[70%] flex flex-col bg-[#050505] border-r border-zinc-900/80 p-12 overflow-y-auto custom-scrollbar">
                    <div className="max-w-5xl space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[16px] font-semibold text-emerald-500  py-1">Question {activeQuestion.toString().padStart(2, '0')}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-100 leading-tight tracking-tight">
                                {data.question}
                            </h2>
                        </div>

                        <div className="space-y-4 pt-4">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedOption(opt.id)}
                                    className={`w-full group flex items-start gap-4 p-5 rounded cursor-pointer border transition-all duration-300 text-left ${selectedOption === opt.id
                                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]'
                                        : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40'
                                        }`}
                                >
                                    <div className={`shrink-0 w-6 h-6 rounded border flex items-center justify-center font-mono text-[10px] font-black transition-all ${selectedOption === opt.id
                                        ? 'bg-emerald-500 border-emerald-500 text-black'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 group-hover:border-zinc-600'
                                        }`}>
                                        {opt.id}
                                    </div>
                                    <span className={`text-[13px] leading-relaxed transition-colors ${selectedOption === opt.id ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-300'
                                        }`}>
                                        {opt.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="h-16 bg-[#080808] border-t border-zinc-900/50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <button
                        className="cursor-pointer px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    >
                        Previous
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        className="cursor-pointer px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-amber-500 hover:bg-zinc-800"
                    >
                        Flag
                    </button>
                    <button
                        className="cursor-pointer px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    >
                        Next
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MCQAssessmentContent;
