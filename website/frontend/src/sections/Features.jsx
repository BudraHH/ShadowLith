import { Ghost, EyeOff, AudioLines, ScanText, BrainCircuit, Activity, Cpu, Layers } from 'lucide-react'
import { LANDING_PAGE_SECTIONS } from '../routes/routes'

const FeatureCard = ({ icon: Icon, title, label, description, metric, color }) => (
    <div className="group relative p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl hover:border-zinc-700/50 transition-all duration-500 overflow-hidden backdrop-blur-sm flex flex-col h-full">
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

        <div className="relative z-10 space-y-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 transition-colors">
                    <Icon size={24} />
                </div>
                <div className="px-2 py-1 rounded bg-zinc-950/50 border border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    {label}
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-bold text-zinc-200 mb-2 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400">
                    {description}
                </p>
            </div>

            <div className="pt-6 border-t border-zinc-800/50 flex items-center gap-2 mt-auto">
                <Activity size={14} className="text-emerald-500" />
                <span className="text-xs font-mono text-emerald-400/80">{metric}</span>
            </div>
        </div>
    </div>
)

const Features = () => {
    return (
        <section id={LANDING_PAGE_SECTIONS.FEATURES} className="relative w-full lg:min-h-screen flex flex-col justify-center py-24 bg-[#030303]">
            <div className="w-full max-w-screen-2xl mx-auto px-6 h-full flex flex-col justify-center">

                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-4">
                        The Triple-Threat Architecture
                    </h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                        Core capabilities designed for absolute stealth and zero-latency intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">

                    {/* Pillar I: Ghost Stealth */}
                    <FeatureCard
                        icon={EyeOff}
                        title="Ghost Stealth"
                        label="DirectX-Shield"
                        description="Utilizes the native SetWindowDisplayAffinity API to apply a WDA_EXCLUDEFROMCAPTURE flag. Even on full screen share, the HUD remains physically invisible to the stream."
                        metric="0% Detection Rate"
                        color="from-zinc-500 to-transparent"
                    />

                    {/* Pillar II: Aural Intelligence */}
                    <FeatureCard
                        icon={AudioLines}
                        title="Aural Intelligence"
                        label="NVIDIA Parakeet-TDT"
                        description="Real-time transcription of system audio (Interviewer voice) via WASAPI Loopback. Operates entirely locally without sending a single byte to the cloud."
                        metric="< 100ms Inference Latency"
                        color="from-blue-500 to-transparent"
                    />

                    {/* Pillar III: Visual OCR */}
                    <FeatureCard
                        icon={ScanText}
                        title="Visual OCR"
                        label="Native WinOCR"
                        description="Precision screen-scraping engine leveraging the Windows.Media.Ocr framework. Instantly captures technical problems, code snippets, or MCQs from selected regions."
                        metric="Sub-50ms Text Extraction"
                        color="from-emerald-500 to-transparent"
                    />

                </div>

                {/* Semantic Bridge */}
                <div className="mt-8 max-w-7xl mx-auto w-full p-8 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 backdrop-blur-sm">
                    <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                        <BrainCircuit size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-zinc-200 mb-1">Integration Logic: The Semantic Bridge</h3>
                        <p className="text-sm text-zinc-500">
                            All captured data (Visual + Aural) is fused into the <span className="text-indigo-400 font-semibold">Gemini 2.5 Pro</span> logic engine. ShadowLith understands context, continuously refining its answers based on the conversation flow.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-500 shrink-0">
                        <Layers size={14} />
                        <span>Context_Window: 2h</span>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default Features
