import React from 'react';
import { motion } from 'framer-motion';

const NotepadMockup = ({ interviewHudCompleted, scrollProgress, showQuery }) => {
    const sqlQuery = `WITH RecentSpend AS (
    SELECT user_id, SUM(total_amount) as total_spend
    FROM Orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id
    ORDER BY total_spend DESC
    LIMIT 5
)
SELECT u.name, u.email, rs.total_spend
FROM Users u
JOIN RecentSpend rs ON u.id = rs.user_id;`;

    return (
        <div className="w-full h-full bg-transparent relative flex items-center justify-center overflow-hidden font-sans">
            {/* Subtle desktop background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Floating Notepad Window */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative w-[80%] h-[80%] mb-16 bg-[#18181b] rounded-lg border border-zinc-700/40 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
            >
                {/* Title Bar */}
                <div className="h-8 bg-[#222225] border-b border-zinc-700/30 flex items-center justify-between px-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-zinc-400 font-medium ml-1">interview_notes.txt</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 p-5 font-mono text-[16px] leading-[1.6] text-zinc-500 overflow-y-auto custom-scrollbar bg-[#141416]">
                    {((interviewHudCompleted && !showQuery && scrollProgress >= 0.95) || (interviewHudCompleted && scrollProgress <= 0.95)) && (
                        <div className="whitespace-pre-wrap text-zinc-300">
                            {sqlQuery}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default NotepadMockup;
