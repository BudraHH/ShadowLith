import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../sections/Hero'
import Features from '../sections/Features'
import HowItWorks from '../sections/HowItWorks'
import Security from '../sections/Security'
import Footer from '../sections/Footer'

const LandingPage = () => {
    const location = useLocation();

    // Handle hash scroll when location changes (including initial load)
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');

            // Wait for components to mount and render
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const navbarHeight = 80;
                    const rect = element.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const elementTop = rect.top + scrollTop;
                    const offsetPosition = Math.max(0, elementTop - navbarHeight);

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 200); // 200ms is safer for component mounting
        }
    }, [location]);

    return (
        <main className="w-full mx-auto flex flex-col items-center">
            <Hero />
            <Features />
            <HowItWorks />
            <Security />
            <Footer />
        </main>
    )
}

export default LandingPage
