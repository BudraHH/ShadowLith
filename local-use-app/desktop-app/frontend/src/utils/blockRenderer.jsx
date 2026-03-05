import React from 'react';
import TextBlock from '../components/TextBlock';
import CodeBlock from '../components/CodeBlock';
import AnalysisBlock from '../components/AnalysisBlock';
import ProblemBlock from '../components/ProblemBlock';
import StrategyBlock from '../components/StrategyBlock';
import InterviewBlock from '../components/InterviewBlock';
import StepsBlock from '../components/StepsBlock';
import OptionBlock from '../components/OptionBlock';

/**
 * renderBlocks
 * Shared logic to render technical information blocks.
 */
export const renderBlocks = (blocks, isStreaming = false) => {
    if (!blocks || !Array.isArray(blocks)) return null;

    return blocks.map((block, idx) => {
        const key = `${block.type}-${idx}`;
        const isLast = idx === blocks.length - 1;

        switch (block.type) {
            case 'text':
                return <TextBlock key={key} isStreaming={isStreaming && isLast}>{block.content}</TextBlock>;
            case 'code':
                return <CodeBlock key={key} code={block.content} language={block.lang || 'javascript'} isStreaming={isStreaming && isLast} />;
            case 'option':
                return <OptionBlock key={key} label={block.label} content={block.content} />;
            case 'analysis':
                return <AnalysisBlock key={key} time={block.time} space={block.space} complexityLabel={block.label} />;
            case 'interview':
                return <InterviewBlock key={key} content={block.content} />;
            case 'problem':
                return <ProblemBlock key={key} content={block.content} />;
            case 'strategy':
                return <StrategyBlock key={key} content={block.content} />;
            case 'step':
                // Grouping steps
                if (idx > 0 && blocks[idx - 1].type === 'step') return null;
                const stepGroup = [];
                let currentIdx = idx;
                while (currentIdx < blocks.length && blocks[currentIdx].type === 'step') {
                    stepGroup.push(blocks[currentIdx]);
                    currentIdx++;
                }
                return <StepsBlock key={key} steps={stepGroup} />;
            default:
                return null;
        }
    });
};
