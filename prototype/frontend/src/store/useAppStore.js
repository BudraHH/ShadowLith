import { create } from 'zustand';

/**
 * useAppStore
 * Clean state-only store. 
 * Removing actions from the store object ensures that components 
 * calling these actions don't accidentally subscribe to state changes.
 */
export const useAppStore = create(() => ({
    mode: "Assessment",
    showChat: false,
    showResponse: true,
}));

// --- STANDALONE ACTIONS (No re-renders when called) ---

export const setModeAction = (val) =>
    useAppStore.setState((state) => ({
        mode: typeof val === 'function' ? val(state.mode) : val
    }));

export const setShowChatAction = (val) =>
    useAppStore.setState((state) => ({
        showChat: typeof val === 'function' ? val(state.showChat) : val
    }));

export const setShowResponseAction = (val) =>
    useAppStore.setState((state) => ({
        showResponse: typeof val === 'function' ? val(state.showResponse) : val
    }));
