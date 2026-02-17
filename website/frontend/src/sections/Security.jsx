import { ShieldCheck, EyeOff, Lock, Network, FileCode } from 'lucide-react'
import { LANDING_PAGE_SECTIONS } from '../routes/routes'


const Security = () => {
    return (
        <section id={LANDING_PAGE_SECTIONS.SECURITY} className="relative w-full lg:min-h-screen py-24 bg-[#030303] flex justify-center items-center">
            <div className="w-full max-w-screen-2xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-20 items-center justify-between">

                    {/* Left Panel: Text Content */}
                    <div className="w-full md:w-1/2 space-y-12">
                        <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-mono tracking-widest uppercase text-emerald-500 mb-6">
                                <ShieldCheck size={12} />
                                Security Protocol
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-tight">
                                Zero-Cloud.<br />
                                <span className="text-zinc-500">Local First.</span>
                            </h2>
                            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                                Unlike traditional AI assistants, ShadowLith performs heavy lifting on your hardware. Your voice never leaves your room.
                            </p>
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000 delay-200">
                            {/* Item 1 */}
                            <div className="flex gap-4 group">
                                <div className="p-3 h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                                    <Network size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">Encrypted Bridge</h4>
                                    <p className="text-sm text-zinc-500 leading-snug max-w-sm mt-1">
                                        Only final extracted text is sent to the LLM. All PII is filtered via Contextual Anonymization.
                                    </p>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className="flex gap-4 group">
                                <div className="p-3 h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                                    <EyeOff size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Anti-Heuristic Stealth</h4>
                                    <p className="text-sm text-zinc-500 leading-snug max-w-sm mt-1">
                                        Engineered to leave zero trace in Taskbar, System Tray, or "Currently Recording" lists.
                                    </p>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className="flex gap-4 group">
                                <div className="p-3 h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all">
                                    <FileCode size={20} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-zinc-200 group-hover:text-purple-400 transition-colors">Open Source Audit</h4>
                                    <p className="text-sm text-zinc-500 leading-snug max-w-sm mt-1">
                                        Our capture modules are open-core. Verify our privacy claims yourself on GitHub.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Panel: Code Block / Visual */}
                    <div className="w-full md:w-1/2 relative animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                        {/* Abstract Lock Graphic */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl font-mono text-xs overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
                            <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-4">
                                <span className="text-zinc-500">security_audit.log</span>
                                <div className="flex gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                                </div>
                            </div>
                            <div className="space-y-2 text-zinc-400">
                                <p><span className="text-emerald-500">audit_chk</span> <span className="text-blue-400">SUCCESS</span> :: WDA_AFFINITY_CONFIRMED</p>
                                <p><span className="text-emerald-500">audit_chk</span> <span className="text-blue-400">SUCCESS</span> :: AUDIO_LOOPBACK_ISOLATED</p>
                                <p><span className="text-emerald-500">audit_chk</span> <span className="text-blue-400">SUCCESS</span> :: MEMORY_PURGE_ACTIVE</p>
                                <p className="opacity-50">----------------------------------------</p>
                                <p className="text-zinc-500"># Verifying outbound traffic...</p>
                                <p><span className="text-purple-400">packet_filter</span> :: BLOCKED [cloud-telemetry.analytics]</p>
                                <p><span className="text-purple-400">packet_filter</span> :: ALLOWED [api.google.gemini] (TLS 1.3)</p>
                                <p className="mt-4 text-emerald-500 animate-pulse">SYSTEM SECURE. READY FOR DEPLOYMENT.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Security
