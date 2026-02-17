import { Ear, ScanEye, BrainCircuit, Box, ArrowRight } from 'lucide-react'
import { LANDING_PAGE_SECTIONS } from '../routes/routes'


const Step = ({ number, title, subtitle, icon: Icon, delay }) => (
    <div className={`relative flex flex-col items-center text-center space-y-4 group animate-in fade-in slide-in-from-bottom-8 duration-700`} style={{ animationDelay: `${delay}ms` }}>
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-100 group-hover:border-zinc-600 transition-all duration-300 shadow-xl z-10 relative">
            <Icon size={28} />
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors">
                {number}
            </div>
        </div>
        <div>
            <h3 className="text-lg font-bold text-zinc-200 mb-1">{title}</h3>
            <p className="text-sm text-zinc-500 max-w-[200px] mx-auto leading-snug">{subtitle}</p>
        </div>
    </div>
)

const Connector = () => (
    <div className="hidden md:block flex-1 h-px bg-zinc-800 mx-4 relative top-[-40px]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-20" />
    </div>
)

const HowItWorks = () => {
    return (
        <section id={LANDING_PAGE_SECTIONS.HOW_IT_WORKS} className="relative w-full lg:min-h-screen flex flex-col justify-center py-24 bg-[#030303] overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="w-full max-w-screen-2xl mx-auto px-6 relative z-10">

                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-6">
                        The Shadow Engine
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6">
                        How It Works
                    </h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                        A seamless loop from hardware interception to intelligent overlay.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Steps Row */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4">

                        <Step
                            number="01"
                            title="Silent Capture"
                            subtitle="Loopback taps audio & compositor hooks grab pixels."
                            icon={Ear}
                            delay={0}
                        />

                        <Connector />

                        <Step
                            number="02"
                            title="Local Fusion"
                            subtitle="On-device ASR & OCR process raw data instantly."
                            icon={ScanEye}
                            delay={200}
                        />

                        <Connector />

                        <Step
                            number="03"
                            title="Semantic Analysis"
                            subtitle="Gemini Engine filters fluff & solves the problem."
                            icon={BrainCircuit}
                            delay={400}
                        />

                        <Connector />

                        <Step
                            number="04"
                            title="Invisible HUD"
                            subtitle="Stealth overlay renders answers in real-time."
                            icon={Box}
                            delay={600}
                        />

                    </div>

                    {/* Stats / Metrics Bottom Bar */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "End-to-End Latency", val: "< 2s" },
                            { label: "Cloud Uploads", val: "0 bytes" },
                            { label: "Hardware Tap", val: "WASAPI" },
                            { label: "Display Affinity", val: "WDA_EXCLUDE" },
                        ].map((stat, idx) => (
                            <div key={idx} className="p-6 rounded-xl bg-zinc-900/20 border border-zinc-800/50 text-center hover:bg-zinc-900/40 transition-colors">
                                <div className="text-2xl font-black text-zinc-200 mb-1">{stat.val}</div>
                                <div className="text-[10px] font-mono uppercase text-zinc-600 tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}

export default HowItWorks
