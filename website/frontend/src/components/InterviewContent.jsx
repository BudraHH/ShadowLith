import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, Mic, Phone, MonitorUp, MessageSquare,
    MoreVertical, Shield, Clock, Hand, Subtitles,
    X, Users, Info, Settings, MicOff, VideoOff
} from 'lucide-react';

const InterviewContent = ({ view }) => {
    return (
        <motion.div
            key="google-meet-carbon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col bg-[#0a0a0a] font-sans overflow-hidden text-white"
        >
            {/* MAIN STAGE AND SIDEBAR CONTAINER */}
            <div className="flex-1 flex overflow-hidden p-3 gap-3">

                {/* 1. THE SHARED SCREEN (Primary Stage) */}
                <div className="flex-1 bg-[#111113] rounded-xl overflow-hidden relative flex flex-col items-center justify-center border border-zinc-800/50">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                        <MonitorUp size={56} strokeWidth={1} className="text-zinc-500" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-500">You are presenting to everyone</p>
                            <button className="mt-3 px-5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-500/10 transition-colors cursor-pointer">
                                Stop presenting
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. PARTICIPANT SIDEBAR (Vertical Rail) */}
                <div className="w-[220px] flex flex-col gap-2.5 overflow-y-auto">
                    {/* Interviewer Tile */}
                    <div className="aspect-video bg-[#111113] rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-800/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-lg font-bold shadow-lg">SJ</div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm text-zinc-300">Sarah Johnson</span>
                        </div>
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
                            <Mic size={12} className="text-emerald-400" />
                        </div>
                        {/* Audio wave indicator */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-[2px]">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [3, 8 + Math.random() * 6, 3] }}
                                    transition={{ duration: 0.5 + Math.random() * 0.3, repeat: 3, delay: i * 0.1 }}
                                    className="w-[2px] bg-emerald-500/50 rounded-full"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Candidate Tile (Self View) */}
                    <div className="aspect-video bg-[#111113] rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-800/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-lg font-bold shadow-lg">HH</div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm text-zinc-300">You</span>
                        </div>
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
                            <Mic size={12} className="text-emerald-400" />
                        </div>
                        <div className="absolute bottom-2 right-2 flex items-center gap-[2px]">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [3, 8 + Math.random() * 6, 3] }}
                                    transition={{ duration: 0.5 + Math.random() * 0.3, repeat: 10, delay: i * 0.1 }}
                                    className="w-[2px] bg-emerald-500/50 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. CONTROL BAR */}
            <div className="h-16 flex items-center justify-between px-6 shrink-0 bg-[#070707] border-t border-zinc-900/50">
                {/* Time/Meeting Code */}
                <div className="flex items-center gap-3 text-[12px] w-1/4 text-zinc-500">
                    <span className="font-mono">19:10</span>
                    <div className="w-px h-3.5 bg-zinc-800" />
                    <span className="font-mono tracking-tight text-zinc-600">qxj-z882-QX</span>
                </div>

                {/* The Pill Controls */}
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"><Mic size={17} /></button>
                    <button className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"><Video size={17} /></button>
                    <button className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"><Subtitles size={17} /></button>
                    <button className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"><Hand size={17} /></button>
                    <button className="w-10 h-10 rounded-full bg-emerald-600/80 border border-emerald-500/30 flex items-center justify-center text-white hover:bg-emerald-500 transition-all cursor-pointer shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"><MonitorUp size={17} /></button>
                    <button className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"><MoreVertical size={17} /></button>

                    <div className="w-px h-5 bg-zinc-800 mx-1" />

                    <button className="w-12 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all cursor-pointer"><Phone size={17} className="rotate-[135deg]" /></button>
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-0.5 w-1/4 justify-end">
                    <button className="p-2.5 hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer"><Info size={18} className="text-zinc-600 hover:text-zinc-400" /></button>
                    <button className="p-2.5 hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer relative">
                        <Users size={18} className="text-zinc-600 hover:text-zinc-400" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#070707]"></span>
                    </button>
                    <button className="p-2.5 hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer"><MessageSquare size={18} className="text-zinc-600 hover:text-zinc-400" /></button>
                    <button className="p-2.5 hover:bg-zinc-800/60 rounded-full transition-colors cursor-pointer"><Shield size={18} className="text-zinc-600 hover:text-zinc-400" /></button>
                </div>
            </div>
        </motion.div>
    );
};

export default InterviewContent;