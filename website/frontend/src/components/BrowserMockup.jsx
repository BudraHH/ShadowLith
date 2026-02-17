import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    RotateCw,
    Shield,
    Plus,
    X,
    MoreVertical,
    Lock,
    Eye,
    EyeOff,
    Terminal,
    Video,
    Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import CodingAssessmentContent from './CodingAssessmentContent';
import MCQAssessmentContent from './MCQAssessmentContent';
import InterviewContent from './InterviewContent';
import { SCENARIO_QUESTIONS } from '../utils/scenarioQuestions';

const BrowserMockup = ({ activeScenario, view = 'your' }) => {
    const [scenario, setScenario] = useState('Coding'); // 'Coding' | 'MCQ' | 'Interview'

    // If controlled externally (e.g. by scroll), sync the prop
    useEffect(() => {
        if (activeScenario) {
            setScenario(activeScenario);
        }
    }, [activeScenario]);

    const scenarios = {
        Coding: {
            tab: "Coding Assessment",
            url: "measureco.com/assessment/coding/1",
            color: "blue"
        },
        MCQ: {
            tab: "MCQ Assessment",
            url: "measureco.com/assessment/mcq/algorithms/8",
            color: "amber"
        },
        Interview: {
            tab: "Live Interview",
            url: "measureco.com/interview/live/xyz-123",
            color: "emerald"
        }
    };

    return (
        <div className="z-20 w-full h-full flex flex-col bg-[#030303] rounded-xl border border-zinc-800/50 shadow-2xl overflow-hidden animate-in fade-in duration-1000">
            {/* TABS BAR */}
            <div className="h-10 bg-[#080808] flex justify-between items-center px-4 gap-2 overflow-hidden border-b border-zinc-900 shrink-0">
                <div className='flex flex-row w-full items-center gap-2'>
                    {/* Tab: Assessment */}
                    <div
                        onClick={() => setScenario('Coding')}
                        className={`relative h-[34px] px-6 flex items-center gap-2 cursor-pointer transition-all rounded-t-lg mt-1 group ${scenario === 'Coding' ? 'bg-[#030303] text-zinc-200 border-x border-t border-zinc-800/50' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Code2 size={12} className={scenario === 'Coding' ? "text-blue-500" : "text-zinc-700"} />
                        <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{scenarios.Coding.tab}</span>
                        {scenario === 'Coding' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500/50" />}
                    </div>

                    {/* Tab: MCQ */}
                    <div
                        onClick={() => setScenario('MCQ')}
                        className={`relative h-[34px] px-6 flex items-center gap-2 cursor-pointer transition-all rounded-t-lg mt-1 group ${scenario === 'MCQ' ? 'bg-[#030303] text-zinc-200 border-x border-t border-zinc-800/50' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Shield size={12} className={scenario === 'MCQ' ? "text-amber-500" : "text-zinc-700"} />
                        <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{scenarios.MCQ.tab}</span>
                        {scenario === 'MCQ' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500/50" />}
                    </div>

                    {/* Tab: Interview */}
                    <div
                        onClick={() => setScenario('Interview')}
                        className={`relative h-[34px] px-6 flex items-center gap-2 cursor-pointer transition-all rounded-t-lg mt-1 group ${scenario === 'Interview' ? 'bg-[#030303] text-zinc-200 border-x border-t border-zinc-800/50' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Video size={12} className={scenario === 'Interview' ? "text-emerald-500" : "text-zinc-700"} />
                        <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{scenarios.Interview.tab}</span>
                        {scenario === 'Interview' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />}
                    </div>

                    <div className="p-1 text-zinc-700 hover:text-zinc-400 cursor-pointer pl-2">
                        <Plus size={14} />
                    </div>
                </div>

                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                </div>
            </div>

            {/* URL BAR */}
            <div className="h-10 bg-[#030303] flex items-center px-3 gap-3 border-b border-zinc-900 shrink-0">
                <div className="flex items-center gap-2 text-zinc-500">
                    <ChevronLeft size={16} />
                    <ChevronRight size={16} className="opacity-30" />
                    <RotateCw size={14} className="ml-1" />
                </div>
                <div className="flex-1 h-7 bg-zinc-900/50 rounded-full border border-zinc-800/50 flex items-center px-3 gap-2">
                    <Lock size={10} className="text-emerald-600/50" />
                    <span className="text-[11px] font-mono text-zinc-500 flex-1 truncate">
                        <span className="opacity-80">https://</span>{scenarios[scenario]?.url || 'measureco.com'}
                    </span>
                </div>


            </div>

            {/* CONTENT AREA */}
            <div className="relative flex-1 bg-[#020202] overflow-hidden">
                <AnimatePresence mode="wait">
                    {scenario === 'Coding' ? (
                        <CodingAssessmentContent view={view} />
                    ) : scenario === 'MCQ' ? (
                        <MCQAssessmentContent view={view} />
                    ) : (
                        <InterviewContent view={view} />
                    )}
                </AnimatePresence>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#050505] border-t border-zinc-900 flex items-center px-4 justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Network_Stable</span>
                    </div>
                </div>
                <div className="text-[8px] text-zinc-700 font-mono">
                    SESSION_ID: {scenario.toUpperCase()}_{view.toUpperCase()}_v1.0
                </div>
            </div>
        </div >
    );
};

export default BrowserMockup;
