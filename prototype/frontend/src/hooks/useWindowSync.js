import { useEffect } from 'react';
import { bridge } from '../api/bridge';

/**
 * useWindowSync
 * Automatically syncs the OS window size with the React component's rendered height.
 */
export const useWindowSync = (elementId, dependencies) => {
    useEffect(() => {
        const syncSize = async () => {
            const el = document.getElementById(elementId);
            if (!el) return;

            // Wait for DOM to settle
            setTimeout(async () => {
                const rect = el.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1.0;

                // We send calculated size to Python
                await bridge.syncWindowSize(
                    Math.ceil(rect.width * dpr),
                    Math.ceil(rect.height * dpr),
                    dpr
                );
            }, 50);
        };

        syncSize();

        // Setup Resize Observer for internal content changes
        const observer = new ResizeObserver(() => syncSize());
        const el = document.getElementById(elementId);
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, dependencies);
};

