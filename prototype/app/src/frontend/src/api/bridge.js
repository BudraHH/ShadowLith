/**
 * bridge.js
 * Centralized API for communicating with the Python backend via pywebview.
 * Handles checks for pywebview availability and provides a clean async interface.
 */

const getApi = () => {
    if (typeof window !== 'undefined' && window.pywebview && window.pywebview.api) {
        return window.pywebview.api;
    }
    return null;
};

export const bridge = {
    // UI Controls
    toggleUI: async () => {
        const api = getApi();
        if (api) return await api.toggle_ui();
        console.warn("Bridge: pywebview.api not found (toggleUI)");
    },

    setGhostMode: async (enabled) => {
        const api = getApi();
        if (api) return await api.set_ghost_mode(enabled);
    },

    setInteractivity: async (interactive) => {
        const api = getApi();
        if (api) return await api.set_interactivity(interactive);
    },

    syncWindowSize: async (width, height, dpr = 1.0) => {
        const api = getApi();
        if (api) return await api.sync_window_size(width, height, dpr);
    },

    setUserContext: async (resume, jd) => {
        const api = getApi();
        if (api) return await api.set_user_context(resume, jd);
    },

    // Capture & Vision
    captureFullscreen: async () => {
        const api = getApi();
        if (api) return await api.capture_fullscreen();
        return { status: "failed", error: "API not available" };
    },

    captureOCR: async () => {
        const api = getApi();
        if (api) return await api.capture_ocr();
        return { status: "failed", error: "API not available" };
    },

    captureVisual: async () => {
        const api = getApi();
        if (api) return await api.capture_visual();
        return { status: "failed", error: "API not available" };
    },

    revokeSnip: async () => {
        const api = getApi();
        if (api) return await api.revoke_snip();
    },

    // AI & Chat
    chat: async (message, isInterviewMode, streamId) => {
        const api = getApi();
        if (api) return await api.chat(message, isInterviewMode, streamId);
        return false;
    },

    startStreamAnswer: async (params) => {
        const api = getApi();
        if (api) {
            const { mode, language, scenario, transcript, isAudit, streamId } = params;
            return await api.start_stream_answer(mode, language, scenario, transcript, isAudit, streamId);
        }
        return false;
    },

    stopStream: async () => {
        const api = getApi();
        if (api) return await api.stop_stream();
    },

    resetChat: async () => {
        const api = getApi();
        if (api) return await api.reset_chat();
    },

    // Audio
    startListening: async () => {
        const api = getApi();
        if (api) return await api.start_listening();
    },

    stopListening: async () => {
        const api = getApi();
        if (api) return await api.stop_listening();
    },

    getLiveTranscript: async () => {
        const api = getApi();
        if (api) return await api.get_live_transcript();
        return "";
    },

    terminateApp: async () => {
        const api = getApi();
        if (api) return await api.terminate_app();
    }
};
