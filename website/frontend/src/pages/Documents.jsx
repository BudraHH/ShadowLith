import { motion } from 'framer-motion'
import { FileText, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../routes/routes'

const Documents = () => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full space-y-8"
            >
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]">
                        <FileText size={40} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        DOCUMENTATION
                    </h1>
                    <p className="text-zinc-500 text-lg">
                        The technical blueprint for absolute stealth is being finalized.
                        Check back soon for architecture deep-dives and integration guides.
                    </p>
                </div>

                <div className="pt-8">
                    <Link
                        to={ROUTES.HOME}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Base
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12">
                    {['Architecture', 'API Reference', 'Security'].map((item) => (
                        <div key={item} className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
                            {item} [PENDING]
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default Documents
