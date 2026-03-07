import { useState, useEffect, useRef } from 'react';
import { bridge } from '../api/bridge';

/**
 * useAudioIO
 * Manages the microphone listener and live transcripts using Real-time Push.
 */
export const useAudioIO = (onSilenceDetected) => {
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState("");
    const [silenceTicks, setSilenceTicks] = useState(0);

    // Use a ref to keep track of the transcript for silence detection
    const transcriptRef = useRef("");

    const toggleListening = async () => {
        if (isListening) {
            await bridge.stopListening();
            setIsListening(false);
        } else {
            await bridge.startListening();
            setIsListening(true);
        }
    };

    useEffect(() => {
        // Register the global push handler
        window.__onTranscript = (text) => {
            if (!text) return;

            console.log("🗣️ Push Transcript:", text);
            setLiveTranscript(prev => {
                const updated = (prev + " " + text).trim();
                transcriptRef.current = updated;
                return updated;
            });
            setSilenceTicks(0);
        };

        return () => {
            delete window.__onTranscript;
        };
    }, []);

    // Silence detection logic
    useEffect(() => {
        let interval;
        if (isListening) {
            interval = setInterval(() => {
                setSilenceTicks(prev => prev + 1);
            }, 10000);
        } else {
            setSilenceTicks(0);
        }
        return () => clearInterval(interval);
    }, [isListening]);

    useEffect(() => {
        // If 4 seconds of silence and we have meaningful text, trigger auto-analysis
        if (isListening && silenceTicks >= 4 && transcriptRef.current.length > 15) {
            console.log("🤫 Silence detected, triggering analysis...");
            onSilenceDetected(transcriptRef.current);
            setSilenceTicks(0);
            transcriptRef.current = "";
            setLiveTranscript(""); // Clear after auto-send
        }
    }, [silenceTicks, isListening, onSilenceDetected]);

    return {
        isListening,
        liveTranscript,
        setLiveTranscript,
        toggleListening
    };
};
