import { useEffect, useRef } from 'react';

/**
 * Custom hook to sync the pywebview window size with a DOM element.
 * @param {string} targetId - The ID of the element to track.
 * @param {Array} dependencies - Array of state/prop values that should trigger a re-sync.
 */
export const useWindowResizeSync = (containerName, targetId = 'resize-target', dependencies = []) => {
    const lastSyncRef = useRef(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!window.pywebview || !window.pywebview.api) return;

        const syncSize = () => {
            const container = document.getElementById(targetId);
            if (container) {
                // Safeguard: Ensure pywebview and the specific API method are available
                if (window.pywebview && window.pywebview.api && typeof window.pywebview.api.sync_window_size === 'function') {
                    // Use offsetHeight to respect max-height/clipping
                    const width = container.offsetWidth;
                    const height = container.offsetHeight;

                    // Add a small buffer to prevent scrollbars or clipping
                    if (containerName !== 'main-layout') {
                        window.pywebview.api.sync_window_size(width + 2, height + 5);
                    } else {
                        window.pywebview.api.sync_window_size(width, height);
                    }
                }
            }
            lastSyncRef.current = Date.now();
            timeoutRef.current = null;
        };

        const throttledSync = () => {
            const now = Date.now();
            const minInterval = 66; // ~15 FPS

            if (now - lastSyncRef.current >= minInterval) {
                // If enough time has passed, sync immediately
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                requestAnimationFrame(syncSize);
            } else if (!timeoutRef.current) {
                // If not enough time has passed, schedule a sync for later
                const remaining = minInterval - (now - lastSyncRef.current);
                timeoutRef.current = setTimeout(() => {
                    requestAnimationFrame(syncSize);
                }, remaining);
            }
        };

        // Create observer
        const observer = new ResizeObserver(() => {
            throttledSync();
        });

        const target = document.getElementById(targetId);
        if (target) {
            observer.observe(target);
            // Initial sync
            syncSize();
        }

        return () => {
            observer.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [targetId, ...dependencies]);
};
