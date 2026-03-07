/**
 * streamParser.js
 * Heuristic parser for partial JSON streams from Gemini.
 * Extracts "blocks" from the incomplete "blocks": [...] array.
 */

export function parsePartialGeminiStream(text) {
    if (!text) return { summary: "", blocks: [] };

    const result = {
        summary: "",
        blocks: []
    };

    // 1. Try to extract summary early
    // Handle summary with possible escaped quotes
    const summaryMatch = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*?)(?:"|$)/);
    if (summaryMatch) {
        result.summary = summaryMatch[1].replace(/\\"/g, '"');
    }

    // 2. Find the blocks array content
    const blocksStart = text.indexOf('"blocks"');
    if (blocksStart === -1) return result;

    const afterBlocksPrefix = text.substring(blocksStart);
    const firstBracket = afterBlocksPrefix.indexOf('[');
    if (firstBracket === -1) return result;

    let arrayContent = afterBlocksPrefix.substring(firstBracket + 1);

    // 3. Heuristic: Split by objects {}
    // We handle partial/unclosed objects by tracking depth manually.
    // We are "quote-aware" to avoid being confused by braces inside strings (like LaTeX).

    const matches = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < arrayContent.length; i++) {
        const char = arrayContent[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0 && start !== -1) {
                    matches.push(arrayContent.substring(start + 1, i));
                    start = -1;
                }
            }
        }
    }

    // Handle the last (possibly unclosed) block
    // Only if we haven't found a complete block yet or we are at the end of string
    if (depth > 0 && start !== -1) {
        matches.push(arrayContent.substring(start + 1));
    }

    matches.forEach(blockText => {
        // More robust property extraction using [\s\S] to match across newlines
        const typeMatch = blockText.match(/"type"\s*:\s*"([^"]*)"/);
        const contentMatch = blockText.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*?)(?:"|$)/);
        const langMatch = blockText.match(/"lang"\s*:\s*"([^"]*)"/);
        const labelMatch = blockText.match(/"label"\s*:\s*"([^"]*)"/);

        if (typeMatch) {
            let extractedContent = contentMatch ? contentMatch[1] : "";

            // Simple unescaping for common JSON escapes
            const cleanContent = extractedContent
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .replace(/\\t/g, '\t');

            result.blocks.push({
                type: typeMatch[1],
                content: cleanContent,
                lang: langMatch ? langMatch[1] : null,
                label: labelMatch ? labelMatch[1] : null
            });
        }
    });

    return result;
}
