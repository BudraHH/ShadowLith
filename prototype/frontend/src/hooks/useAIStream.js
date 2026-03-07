import { useState, useEffect, useRef } from 'react';
import { parsePartialGeminiStream } from '../utils/streamParser';

/**
 * useAIStream
 * Custom hook to handle real-time streaming from the Python backend.
 * Manages chunk accumulation, parsing, and dual-destination routing (Chat vs Response).
 */
export const useAIStream = (onChatResult, onResponseResult) => {
    const [streamingText, setStreamingText] = useState("");
    const [isResponseProcessing, setIsResponseProcessing] = useState(false);
    const [isChatProcessing, setIsChatProcessing] = useState(false);
    const accumTextRef = useRef("");
    const currentStreamIdRef = useRef(null);
    const streamTypeRef = useRef(null);

    const startStream = (type = 'analysis') => {
        const streamId = Math.random().toString(36).substring(7);
        currentStreamIdRef.current = streamId;
        streamTypeRef.current = type;
        if (type === 'chat') setIsChatProcessing(true);
        else setIsResponseProcessing(true);
        accumTextRef.current = "";
        setStreamingText("");
        return streamId;
    };

    const stopStream = () => {
        setIsResponseProcessing(false);
        setIsChatProcessing(false);
        setStreamingText("");
        accumTextRef.current = "";
        currentStreamIdRef.current = null;
    };

    useEffect(() => {
        window.__onStreamChunk = (chunk, streamId) => {
            if (streamId && currentStreamIdRef.current !== streamId) return;

            if (accumTextRef.current === "" && chunk !== "") {
                // Potential callback to clear data on first chunk
            }
            accumTextRef.current += chunk;
            setStreamingText(accumTextRef.current);
        };

        window.__onStreamEnd = (streamId) => {
            if (streamId && currentStreamIdRef.current !== streamId) return;

            const finalResult = accumTextRef.current;
            stopStream();

            if (!finalResult || finalResult.trim() === "") {
                onResponseResult({
                    error: true,
                    message: "NO RESPONSE: The AI engine failed to provide output."
                });
                return;
            }

            try {
                let text = finalResult.trim();
                // Strip Markdown
                if (text.includes("```")) {
                    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
                }
                const startIdx = text.indexOf('{');
                const endIdx = text.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    text = text.substring(startIdx, endIdx + 1);
                }

                // Robust JSON Pre-Cleaner: Fixes unescaped quotes inside content strings
                // This targets the specific "operators = {"+"...}" breakout pattern
                const cleanedText = text.replace(/"content":\s*"([\s\S]*?)"\s*([,}])/g, (match, p1, p2) => {
                    // Re-escape any internal quotes that aren't already escaped
                    // This is a heuristic but covers 99% of code block breakouts
                    const escapedContent = p1.replace(/(?<!\\)"/g, '\\"');
                    return `"content": "${escapedContent}"${p2}`;
                });

                const parsed = JSON.parse(cleanedText);
                if (!parsed.blocks) return;

                const chatBlocks = parsed.blocks.filter(b => b.type === 'text');
                const techBlocks = parsed.blocks.filter(b => b.type !== 'text');

                if (chatBlocks.length > 0) {
                    onChatResult(chatBlocks, techBlocks.length > 0);
                }

                if (techBlocks.length > 0) {
                    onResponseResult({ ...parsed, blocks: techBlocks });
                }
            } catch (e) {
                console.error("Stream Parsing Error:", e, finalResult);
                onResponseResult({
                    error: true,
                    message: finalResult.includes("RESOURCE_EXHAUSTED") ? "⚠️ API QUOTA EXCEEDED" : "⚠️ ENGINE ERROR",
                    isQuota: finalResult.includes("RESOURCE_EXHAUSTED"),
                    raw: finalResult
                });
            }
        };

        return () => {
            delete window.__onStreamChunk;
            delete window.__onStreamEnd;
        };
    }, []);

    return {
        streamingText,
        isResponseProcessing,
        isChatProcessing,
        startStream,
        stopStream
    };
};
