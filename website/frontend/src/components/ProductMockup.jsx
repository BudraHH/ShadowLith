import React, { useState, useEffect } from 'react';
import ModelSelectionMockup from './ModelSelectionMockup';
import ActualUiMockup from './ActualUiMockup';
import { motion, AnimatePresence } from 'framer-motion';

const ProductMockup = ({ type, setType, view, onInterviewHudComplete, setShowQuery, interviewHudCompleted, interviewHudStarted, setInterviewHudStarted }) => {

    if (view === "proctor") {
        return;
    }

    return (
        <div className="relative w-full h-full max-h-[700px] flex items-center justify-center">
            {type === 'Selection' ? (
                <div
                    key="selection"
                    className="w-full"
                >
                    <ModelSelectionMockup />
                </div>
            ) : (
                <div
                    key="hud"
                    className="w-full flex items-center justify-center"
                >
                    <div className="w-full origin-center transform-gpu shadow-2xl rounded-xl overflow-hidden">
                        <ActualUiMockup
                            mode={type}
                            setMode={setType}
                            onInterviewHudComplete={onInterviewHudComplete}
                            hasTriggeredInterview={interviewHudStarted}
                            setHasTriggeredInterview={setInterviewHudStarted}
                            hasCompletedInterview={interviewHudCompleted}
                            setShowQuery={setShowQuery}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


export default ProductMockup;
