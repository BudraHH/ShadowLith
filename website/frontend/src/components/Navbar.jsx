import { useState, useEffect } from "react";
import { Download, Menu, X, Terminal, Activity, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTES, LANDING_PAGE_SECTIONS, getSectionAnchor } from "../routes/routes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === ROUTES.HOME;

    const [activeSection, setActiveSection] = useState(() => {
        if (location.pathname === ROUTES.HOME) return LANDING_PAGE_SECTIONS.HERO;
        if (location.pathname === ROUTES.DOCS) return 'docs';
        return null;
    });

    // Monitor scroll for glass effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Track active section on scroll using IntersectionObserver
    useEffect(() => {
        if (location.pathname !== ROUTES.HOME) {
            setActiveSection('docs');
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        const sections = Object.values(LANDING_PAGE_SECTIONS);

        sections.forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [location.pathname]);

    const scrollToSection = (sectionId) => {
        setIsMobileMenuOpen(false);

        const performScroll = (targetElement) => {
            if (!targetElement) return;

            document.body.dataset.navScrolling = 'true';

            // Standard navbar height offset
            const navbarHeight = 80;

            requestAnimationFrame(() => {
                const rect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const elementTop = rect.top + scrollTop;
                const offsetPosition = Math.max(0, elementTop - navbarHeight);

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Monitor scroll progress and ensure we reach target (robust completion check)
                let checkCount = 0;
                const maxChecks = 40;
                const checkProgress = () => {
                    checkCount++;
                    const currentPos = window.scrollY;
                    const distance = Math.abs(currentPos - offsetPosition);

                    if (distance <= 10 || checkCount >= maxChecks) {
                        if (distance > 2) window.scrollTo({ top: offsetPosition, behavior: 'auto' });

                        // If scrolling to hero, clear the hash entirely
                        if (sectionId === LANDING_PAGE_SECTIONS.HERO) {
                            window.history.replaceState(null, null, window.location.pathname);
                        } else {
                            window.history.replaceState(null, null, `#${sectionId}`);
                        }

                        document.body.dataset.navScrolling = 'false';
                        return;
                    }
                    setTimeout(checkProgress, 100);
                };
                setTimeout(checkProgress, 300);
            });
        };

        if (isHomePage) {
            const element = document.getElementById(sectionId);
            if (element) performScroll(element);
            else if (sectionId === LANDING_PAGE_SECTIONS.HERO) window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate(getSectionAnchor(sectionId));
        }
    };

    const navLinks = [
        { name: "Home", id: LANDING_PAGE_SECTIONS.HERO, path: ROUTES.HOME },
        { name: "Features", id: LANDING_PAGE_SECTIONS.FEATURES, path: getSectionAnchor(LANDING_PAGE_SECTIONS.FEATURES) },
        { name: "How It Works", id: LANDING_PAGE_SECTIONS.HOW_IT_WORKS, path: getSectionAnchor(LANDING_PAGE_SECTIONS.HOW_IT_WORKS) },
        { name: "Security", id: LANDING_PAGE_SECTIONS.SECURITY, path: getSectionAnchor(LANDING_PAGE_SECTIONS.SECURITY) },
        { name: "Docs", id: "docs", path: ROUTES.DOCS },
    ];

    const isActive = (link) => {
        if (location.pathname === ROUTES.HOME) {
            return activeSection === link.id;
        }
        return link.path === location.pathname;
    };

    const handleNavClick = (link) => {
        // Core Logic:
        // 1. If we're on Home and it's a section, just scroll. (Home link is a section too)
        if (isHomePage && link.id && Object.values(LANDING_PAGE_SECTIONS).includes(link.id)) {
            scrollToSection(link.id);
            return;
        }

        // 2. Otherwise navigate to the provided path
        if (link.path) {
            navigate(link.path);
        } else if (link.href) {
            window.location.href = link.href;
        }
    };

    return (
        <>
            <nav
                className={cn(
                    "sticky top-0 z-50 w-full transition-all duration-500 border-b",
                    isScrolled
                        ? "bg-black/80 backdrop-blur-xl border-zinc-800 py-3"
                        : "bg-transparent border-transparent py-6"
                )}
            >
                <div className="w-full px-6 xl:px-72 flex items-center justify-between">

                    {/* LOGO */}
                    <Link
                        to="/"
                        onClick={(e) => {
                            if (location.pathname === ROUTES.HOME) {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                window.history.replaceState(null, null, window.location.pathname);
                            }
                        }}
                        className="flex items-baseline gap-1 group"
                    >

                        <span className="text-xl font-black tracking-tighter text-white transition-colors">
                            <span className="group-hover:text-emerald-500/30 transition-colors ">SHADOW</span>LITH
                        </span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>

                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            {navLinks.map((link) => (
                                <div key={link.name} className="flex items-center">
                                    {link.name === "Docs" && <div className="h-4 w-px bg-zinc-800 mx-3" />}
                                    <button
                                        onClick={() => handleNavClick(link)}
                                        className={cn(
                                            "px-4 py-2 text-[10px] font-bold cursor-pointer uppercase tracking-widest transition-all relative group",
                                            isActive(link) ? "text-emerald-500" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        <span className="relative z-10">{link.name}</span>
                                        {isActive(link) && (
                                            <motion.div
                                                layoutId="nav-active-pill"
                                                className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/20 rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* <div className="h-4 w-px bg-zinc-800" /> */}

                        <div className="flex items-center gap-6">
                            <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-600 font-mono">
                                <Terminal size={12} className="text-zinc-700" />
                                <span>v1.2.4-ALPHA</span>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-95 group">
                                <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                                Download Alpha
                            </button>
                        </div>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button
                        className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                </div>
            </nav>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl lg:hidden flex flex-col items-center justify-center p-6"
                    >
                        <div className="flex flex-col items-center gap-8 w-full max-w-xs">
                            {navLinks.map((link, idx) => (
                                <motion.button
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleNavClick(link)}
                                    className={cn(
                                        "text-3xl font-black uppercase tracking-tighter transition-colors",
                                        isActive(link) ? "text-emerald-500" : "text-zinc-500 hover:text-white"
                                    )}
                                >
                                    {link.name}
                                </motion.button>
                            ))}
                            <div className="w-full h-px bg-zinc-800 my-4" />
                            <button className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg uppercase tracking-widest">
                                Download Alpha
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
