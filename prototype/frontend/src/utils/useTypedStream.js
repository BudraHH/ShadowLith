import { useState, useEffect, useRef } from 'react';

/**
 * useTypedStream Hook
 * Buffers incoming text and emits it at a fluid, consistent rate to create a "typing" effect.
 * 
 * @param {string} rawInput - The raw accumulated text from the stream.
 * @param {boolean} isProcessing - Whether the stream is active.
 * @param {number} speed - The average speed of typing (ms per character).
 */
export const useTypedStream = (rawInput, isProcessing, speed = 10) => {
    const [displayedText, setDisplayedText] = useState("");
    const backlogRef = useRef("");
    const lastOutputRef = useRef("");
    const timerRef = useRef(null);

    // Sync when rawInput resets or changes significantly
    useEffect(() => {
        if (!rawInput) {
            setDisplayedText("");
            backlogRef.current = "";
            lastOutputRef.current = "";
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        // Logic: Calculate what's NEW in rawInput vs what we've already handled
        // rawInput is cumulative, so we find the delta.
        if (rawInput.length > lastOutputRef.current.length) {
            const delta = rawInput.substring(lastOutputRef.current.length);
            backlogRef.current += delta;
            lastOutputRef.current = rawInput;
        }
    }, [rawInput]);

    useEffect(() => {
        if (isProcessing || backlogRef.current.length > 0) {
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    if (backlogRef.current.length > 0) {
                        // Extract next "chunk" to type
                        // We can type word by word or character by character.
                        // For a "fluid" feel, let's do 1-3 characters at a time.
                        const charsToTake = Math.min(backlogRef.current.length, Math.floor(Math.random() * 3) + 1);
                        const nextPart = backlogRef.current.substring(0, charsToTake);

                        setDisplayedText(prev => prev + nextPart);
                        backlogRef.current = backlogRef.current.substring(charsToTake);
                    } else if (!isProcessing) {
                        // If stream ended and backlog is empty, clear interval
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                }, speed);
            }
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isProcessing, speed]);

    return displayedText;
};
