import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'
import { Check, Clipboard, Download, ShieldCheck, Terminal, Zap, Cpu, Activity, Lock, Globe, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LANDING_PAGE_SECTIONS, ROUTES } from '../routes/routes'
import ProductMockup from '../components/ProductMockup'
import BrowserMockup from '@/components/BrowserMockup'
import DesktopMockup from '@/components/DesktopMockup'
import NotepadMockup from '@/components/NotepadMockup'

const Hero = () => {
    const [copied, setCopied] = useState(false);
    const containerRef = useRef(null);
    const scrollSectionRef = useRef(null);
    const [activeScenario, setActiveScenario] = useState('Coding');
    const [transitionProgress, setTransitionProgress] = useState(0); // 0 = no transition, 1 = fully transitioned
    const [showProductMockup, setShowProductMockup] = useState(true);
    const installCommand = `iex (iwr -useb ${ROUTES.INSTALL_SCRIPT})`;
    const [view, setView] = useState("your");

    const [progressPersistance, setProgressPersistance] = useState(0);

    const [mockupUI, setMockupUI] = useState('Selection');
    const [interviewHudStarted, setInterviewHudStarted] = useState(false);
    const [interviewHudCompleted, setInterviewHudCompleted] = useState(false);
    const [showQuery, setShowQuery] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(installCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Scroll-driven tab switching + transition
    useEffect(() => {
        const handleScroll = () => {
            if (!scrollSectionRef.current) return;

            const rect = scrollSectionRef.current.getBoundingClientRect();
            const sectionHeight = scrollSectionRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;

            const scrolledInto = -rect.top;
            const scrollableDistance = sectionHeight - viewportHeight;

            if (scrollableDistance <= 0) return;

            const progress = Math.max(0, Math.min(1, scrolledInto / scrollableDistance));
            setProgressPersistance(progress);
            // Zones:
            // 0.00 - 0.20 → Coding Assessment
            // 0.20 - 0.40 → MCQ
            // 0.40 - 0.55 → Interview (hold to show it)
            // 0.55 - 1.00 → Transition: Browser shrinks left, Desktop slides in from right
            let currentScenario = 'Coding';
            if (progress > 0 && progress < 0.10) {
                setMockupUI('Selection');
            } else if (progress < 0.20) {
                currentScenario = 'Coding';
                setTransitionProgress(0);
            } else if (progress < 0.40) {
                currentScenario = 'MCQ';
                setTransitionProgress(0);
            } else if (progress < 0.55) {
                currentScenario = 'Interview';
                setTransitionProgress(0);
            } else {
                currentScenario = 'Interview';
                // Map 0.55-1.0 → 0-1
                const t = Math.min(1, (progress - 0.55) / 0.45);
                setTransitionProgress(t);
            }

            console.log("progress", progressPersistance);
            setActiveScenario(currentScenario);
            setMockupUI(progress === 0 ? 'Selection' : currentScenario);
            setShowProductMockup(progress !== 1);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const stats = [
        { label: "Neural Latency", value: "38MS", icon: Zap, color: "text-emerald-500" },
        { label: "Stealth Integrity", value: "100%", icon: ShieldCheck, color: "text-blue-500" },
        { label: "Architecture", value: "X64_NT", icon: Cpu, color: "text-purple-500" }
    ];

    // Transition transforms
    const browserScale = 1 - (1 * transitionProgress);                 // 1 → 0.75
    const browserX = -(transitionProgress * 110);                           // 0% → -110%
    const browserOpacity = 1 - Math.max(0, (transitionProgress - 0.6) / 0.4); // fade out last 40%

    const notepadScale = 0.75 + (0.25 * transitionProgress);              // 0.75 → 1
    const notepadX = (1 - transitionProgress) * 10;                       // 110% → 0%
    const notepadOpacity = Math.min(1, transitionProgress / 0.3);          // fade in first 30%

    const handleViewChange = (view) => {
        setView(view);
        if (view === "your") {
            setShowProductMockup(true);
        } else {
            setShowProductMockup(false);
        }
    };

    return (
        <section
            ref={containerRef}
            id={LANDING_PAGE_SECTIONS.HERO}
            className="relative w-full bg-[#020202] text-zinc-100 z-10"
        >
            <div className="z-20 absolute w-full grid grid-cols-1 lg:grid-cols-12 h-[200vh] flex pt-[240px] px-4 md:px-12 xl:px-72 pointer-events-none  ">
                <div className="lg:col-span-6 w-1/2 h-1/2 flex items-center justify-center pointer-events-none">

                </div>

                {showProductMockup && (
                    <div
                        className={`fixed center right-0 lg:col-span-6 z-10 pointer-events-auto ${mockupUI === "Selection" ? "shadow-[40px_80px_40px_-15px_rgba(255,255,255,0.1)]" : ""}`}
                        style={{ marginTop: mockupUI === "Selection" ? "14rem" : "29rem", marginRight: mockupUI === "Selection" ? "18rem" : "20rem", width: mockupUI === "Selection" ? "40%" : mockupUI === "Interview" ? "45%" : "35%", height: mockupUI === "Selection" ? "" : "30%", transition: "all 0.5s ease-in-out" }}
                    >
                        <ProductMockup type={mockupUI} setType={setMockupUI} view={view} onInterviewHudComplete={() => setInterviewHudCompleted(true)} interviewHudCompleted={interviewHudCompleted} setShowQuery={setShowQuery} interviewHudStarted={interviewHudStarted} setInterviewHudStarted={setInterviewHudStarted} />
                    </div>
                )}
            </div>

            {/* FIRST 100VH: MAIN CORE CONTENT */}
            <div className="relative w-full h-screen flex items-center justify-center px-4 md:px-12 xl:px-72">
                <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
                    {/* LEFT COLUMN: BRANDING & HEADLINE */}
                    <div className="lg:col-span-6 flex flex-col items-start text-left space-y-8">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.2 } }
                            }}
                            className='w-full'
                        >
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 mb-6"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Triple-Threat Architecture Online</span>
                            </motion.div>

                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="text-6xl md:text-8xl xl:text-[110px] font-black leading-[0.9] tracking-tighter mb-8"
                            >
                                THE <span className="text-emerald-500/50 hover:text-emerald-500/5 transition-colors">GHOST</span> IN <br />
                                <span className="relative">
                                    THE MACHINE
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="max-w-2xl text-xl md:text-2xl text-zinc-400 leading-[1.6] font-medium mb-12"
                            >
                                A Windows-native intelligence layer that transcribes audio locally and scrapes visual data in real-time.
                                Built for environments where <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">absolute <span className="hover:text-white/5 transition-colors">invisibility</span></span> is the only acceptable metric.
                            </motion.p>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                transition={{ delay: 1.2 }}
                            >
                                <span className="text-zinc-500 text-lg">Mathematically undetectable. Kernel-level integration. Zero cloud leakage.</span>
                            </motion.div>
                        </motion.div>
                    </div>


                </div>
            </div>

            {/* SECOND SECTION: BROWSER MOCKUP WITH SCROLL-DRIVEN TABS + TRANSITION */}
            {/* 300vh total: 100vh visible + 200vh scroll buffer */}
            <div ref={scrollSectionRef} className="relative w-full h-[300vh] ">
                <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center">
                    skip to previous
                </div>
                <div className="sticky top-0 w-full gap-2 h-screen flex flex-col items-end justify-center px-4 md:px-12 xl:px-72 pt-10 ">
                    {/* PERSPECTIVE SWITCHER */}
                    <div className="flex bg-zinc-900/80 rounded-lg p-0.5 border border-zinc-800/50">
                        <button
                            onClick={() => handleViewChange("your")}
                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${view === "your" ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <Eye size={10} /> Your View
                        </button>
                        <button
                            onClick={() => handleViewChange("proctor")}
                            className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${view === "proctor" ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <EyeOff size={10} /> {mockupUI === "Interview" ? "Interviewer's" : "Proctor"} View
                        </button>
                    </div>
                    <div className="w-full h-[80vh] flex flex-col relative border border-zinc-800/50 shadow-2xl rounded-xl overflow-hidden">

                        {/* Browser Mockup — shrinks and slides left during transition */}
                        <div
                            className="absolute inset-0 will-change-transform"
                            style={{
                                transform: `translateX(${browserX}%) scale(${browserScale})`,
                                opacity: browserOpacity,
                                transition: 'none',
                                pointerEvents: transitionProgress > 0.8 ? 'none' : 'auto',
                            }}
                        >
                            <BrowserMockup activeScenario={activeScenario} view={view} />
                        </div>

                        {/* PROCTOR WATERMARK (Visible in 'Proctor View') */}
                        <AnimatePresence>
                            {view === 'proctor' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 pointer-events-none border-[100px] animate-pulse border-emerald-500/5 flex items-center justify-center opacity-40 z-50"
                                >
                                    <span className="text-[100px] font-black text-emerald-500/5 select-none tracking-tighter">ENCRYPTED</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Desktop Mockup — slides in from right during transition */}
                        {transitionProgress > 0 && (
                            <div
                                className="absolute inset-0 will-change-transform"
                                style={{
                                    transform: `translateX(${notepadX}%) scale(${notepadScale})`,
                                    opacity: notepadOpacity,
                                    transition: 'none',
                                    pointerEvents: transitionProgress < 0.2 ? 'none' : 'auto',
                                }}
                            >
                                <NotepadMockup interviewHudCompleted={interviewHudCompleted} scrollProgress={progressPersistance} />
                            </div>
                        )}
                        {transitionProgress > 0 && (
                            <div className="-z-10 absolute inset-0">
                                <DesktopMockup notepadOpacity={notepadOpacity} />
                            </div>)}
                    </div>
                </div>
            </div>

        </section>
    )
}

export default Hero