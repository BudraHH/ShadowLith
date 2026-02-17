import React from 'react';
import { motion } from 'framer-motion';
import {
    Search, Wifi, Volume2, BatteryFull,
    FolderOpen, Terminal, FileText
} from 'lucide-react';

// Firefox SVG — lucide-react doesn't have brand icons
const FirefoxIcon = ({ size = 16, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-1.5-.33-2.92-.92-4.2-.08.92-.44 1.74-.94 2.42a4.5 4.5 0 0 0-.52-2.93c-.3.72-.82 1.33-1.48 1.74a5.2 5.2 0 0 0-1.06-3.36c.18.82.08 1.68-.28 2.46-.6-1.1-1.6-1.9-2.78-2.22.52.58.84 1.32.9 2.1a3.6 3.6 0 0 0-2.48-.56c1.1.48 1.88 1.48 2.06 2.66a3.3 3.3 0 0 1-1.64.12c.52.74.68 1.7.42 2.56-.34 1.1-1.22 1.96-2.32 2.28a4.14 4.14 0 0 1-2.92-.2A3.87 3.87 0 0 1 5.9 13.1c-.06.96.24 1.92.84 2.68A6.35 6.35 0 0 1 5.5 12c0-.82.16-1.6.44-2.32a4.8 4.8 0 0 1 1.9-2.5A5.52 5.52 0 0 1 12 5.8c.86 0 1.7.2 2.46.56A7.98 7.98 0 0 0 12 2Z" fill="currentColor" />
    </svg>
);

const DesktopMockup = ({notepadOpacity}) => {
    return (
        <div className="z-0 w-full h-full flex flex-col bg-[#030303] rounded-xl border border-zinc-800/50 shadow-2xl overflow-hidden select-none">

            {/* Desktop Background — subtle grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[50%] bg-blue-900/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Desktop Area */}
            <div className="flex-1 relative p-4 flex">

                {/* Desktop Icons — Left Column */}
                <div className="flex flex-col gap-5 w-16 shrink-0 pt-2">
                    {[
                        { icon: FolderOpen, label: 'Projects', color: 'text-amber-500/60' },
                        { label: 'Firefox', color: 'text-orange-500/60', isFirefox: true },
                        { icon: Terminal, label: 'Terminal', color: 'text-emerald-500/60' },
                        { icon: FileText, label: 'Notes', color: 'text-zinc-400/60' },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 cursor-default group">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800/30 border border-zinc-800/40 flex items-center justify-center group-hover:bg-zinc-800/50 transition-colors">
                                {item.isFirefox ? (
                                    <FirefoxIcon size={18} className={item.color} />
                                ) : (
                                    <item.icon size={18} className={item.color} />
                                )}
                            </div>
                            <span className="text-[8px] text-zinc-600 font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>

            </div>

            {/* Taskbar — Windows 11 Style */}
            <div className="h-12 bg-[#0c0c0f]/95 backdrop-blur-2xl border-t border-zinc-800/30 flex items-center justify-between px-2 shrink-0 z-50 relative">

                {/* Left: Windows Start + Search */}
                <div className="flex items-center gap-0.5 w-[25%]">
                    {/* Windows Logo */}
                    <div className="w-10 h-10 rounded-md hover:bg-zinc-800/50 flex items-center justify-center cursor-default transition-colors">
                        <svg width="14" height="14" viewBox="0 0 16 16" className="text-zinc-400">
                            <rect x="0" y="0" width="7" height="7" rx="1" fill="currentColor" />
                            <rect x="9" y="0" width="7" height="7" rx="1" fill="currentColor" />
                            <rect x="0" y="9" width="7" height="7" rx="1" fill="currentColor" />
                            <rect x="9" y="9" width="7" height="7" rx="1" fill="currentColor" />
                        </svg>
                    </div>
                    {/* Search */}
                    <div className="w-10 h-10 rounded-md hover:bg-zinc-800/50 flex items-center justify-center cursor-default transition-colors">
                        <Search size={14} className="text-zinc-500" />
                    </div>
                </div>

                {/* Center: Pinned App Icons */}
                <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    {[
                        { label: 'Firefox', active: notepadOpacity !== 1, isFirefox: true },
                        { icon: FolderOpen, label: 'Explorer', active: false, color: 'text-amber-500/50' },
                        { icon: Terminal, label: 'Terminal', active: false, color: 'text-zinc-500' },
                        { icon: FileText, label: 'Notes', active: notepadOpacity === 1, color: notepadOpacity === 1 ? 'text-zinc-200' : 'text-zinc-500' },
                    ].map((item, i) => (
                        <div key={i} className="relative flex flex-col items-center cursor-default group">
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${item.active ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/40'}`}>
                                {item.isFirefox ? (
                                    <FirefoxIcon size={16} className={`${item.active ? 'text-orange-500' : 'text-orange-500/40'}`} />
                                ) : (
                                    <item.icon size={16} className={item.color} />
                                )}
                            </div>
                            {/* Active indicator line */}
                            {item.active && (
                                <div className="absolute -bottom-0.5 w-4 h-[3px] rounded-full bg-emerald-500/70" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Right: System Tray + Clock */}
                <div className="flex items-center gap-1 w-[25%] justify-end">
                    {/* Hidden icons chevron */}
                    <div className="w-6 h-8 rounded hover:bg-zinc-800/50 flex items-center justify-center cursor-default transition-colors">
                        <svg width="8" height="5" viewBox="0 0 8 5" className="text-zinc-600">
                            <path d="M0 0 L4 5 L8 0" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Grouped system icons */}
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/40 cursor-default transition-colors">
                        <Wifi size={13} className="text-zinc-500" />
                        <Volume2 size={13} className="text-zinc-500" />
                        <BatteryFull size={13} className="text-zinc-500" />
                    </div>

                    {/* Date & Time — stacked like Win 11 */}
                    <div className="flex flex-col items-end px-2 py-1 rounded-md hover:bg-zinc-800/40 cursor-default transition-colors leading-tight">
                        <span className="text-[11px] text-zinc-400 font-medium">7:19 PM</span>
                        <span className="text-[10px] text-zinc-600 font-medium">17-02-2026</span>
                    </div>

                    {/* Show Desktop sliver */}
                    <div className="w-[3px] h-8 bg-zinc-800/50 rounded-full ml-0.5 hover:bg-zinc-700/50 cursor-default transition-colors" />
                </div>
            </div>
        </div>
    );
};

export default DesktopMockup;
