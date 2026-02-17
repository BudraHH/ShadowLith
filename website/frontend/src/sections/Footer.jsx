import { Github, Twitter, Disc, Server, BookOpen, Shield, Download } from 'lucide-react'
import { LANDING_PAGE_SECTIONS, ROUTES, getSectionAnchor } from '../routes/routes'


const Footer = () => {
    return (
        <footer id={LANDING_PAGE_SECTIONS.FOOTER} className="relative w-full bg-black border-t border-zinc-900 pt-24 pb-12 flex flex-col justify-between">
            <div className="w-full max-w-screen-2xl mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-24">

                    {/* Brand Column */}
                    <div className="md:col-span-1 space-y-6">
                        <h2 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                            SHADOWLITH
                        </h2>
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                            Built for the next generation of technical elite. Engineered for absolute stealth and uncompromising intelligence.
                        </p>
                        <div className="flex gap-4">
                            <a href={ROUTES.GITHUB} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"><Github size={16} /></a>
                            <a href={ROUTES.TWITTER} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"><Twitter size={16} /></a>
                            <a href={ROUTES.DISCORD} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"><Disc size={16} /></a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-6">The Engine</h4>
                        <ul className="space-y-4 text-sm text-zinc-600">
                            <li><a href={getSectionAnchor(LANDING_PAGE_SECTIONS.FEATURES)} className="hover:text-emerald-400 transition-colors">Architecture Config</a></li>
                            <li><a href={getSectionAnchor(LANDING_PAGE_SECTIONS.FEATURES)} className="hover:text-emerald-400 transition-colors">Ghost Stealth</a></li>
                            <li><a href={getSectionAnchor(LANDING_PAGE_SECTIONS.HOW_IT_WORKS)} className="hover:text-emerald-400 transition-colors">Aural Intelligence</a></li>
                            <li><a href={getSectionAnchor(LANDING_PAGE_SECTIONS.SECURITY)} className="hover:text-emerald-400 transition-colors">WinOCR Pipeline</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-zinc-600">
                            <li><a href={ROUTES.EXTERNAL_DOCS} className="hover:text-blue-400 transition-colors flex items-center gap-2"><BookOpen size={12} /> Documentation</a></li>
                            <li><a href={ROUTES.EXTERNAL_DOCS} className="hover:text-blue-400 transition-colors flex items-center gap-2"><Download size={12} /> Install Guide</a></li>
                            <li><a href={ROUTES.EXTERNAL_DOCS} className="hover:text-blue-400 transition-colors flex items-center gap-2"><Shield size={12} /> Security Audit</a></li>
                            <li><a href={getSectionAnchor(LANDING_PAGE_SECTIONS.FEATURES)} className="hover:text-blue-400 transition-colors flex items-center gap-2"><Server size={12} /> System Reqs</a></li>
                        </ul>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent rounded-xl -z-10" />
                        <div className="p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
                            <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-wide">System Status</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono text-zinc-300 border-b border-zinc-800 pb-1">
                                    <span>GEMINI-PRO</span>
                                    <span className="text-emerald-500">ONLINE</span>
                                </div>
                                <div className="flex justify-between text-xs font-mono text-zinc-300 border-b border-zinc-800 pb-1">
                                    <span>LATENCY</span>
                                    <span className="text-emerald-500">&lt; 150ms</span>
                                </div>
                                <div className="flex justify-between text-xs font-mono text-zinc-300">
                                    <span>STEALTH</span>
                                    <span className="text-emerald-500">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-zinc-900 bg-zinc-950 py-8">
                <div className="w-full max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] text-zinc-600 font-mono">
                        © 2026 ShadowLith Labs. All systems nominal.
                    </div>
                    <div className="flex gap-6 text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                        <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-400">Terms of stealth</a>
                        <a href="#" className="hover:text-zinc-400">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
