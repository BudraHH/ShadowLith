import React, { useState, useEffect } from 'react';
import ModeSelection from './layout/ModeSelection';
import ContextSetup from './layout/ContextSetup';
import MainLayout from './layout/MainLayout';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showContextSetup, setShowContextSetup] = useState(false);
  const [mode, setMode] = useState("Assessment");
  const [userContext, setUserContext] = useState({ resume: "", jd: "" });

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === "Interview") {
      setShowContextSetup(true);
    } else {
      if (window.pywebview) {
        window.pywebview.api.set_interactivity(false);
      }
      setIsInitialized(true);
    }
  };

  const handleContextComplete = async ({ resume, jd }) => {
    setUserContext({ resume, jd });
    if (window.pywebview) {
      await window.pywebview.api.set_user_context(resume, jd);
      await window.pywebview.api.set_interactivity(false);
    }
    setShowContextSetup(false);
    setIsInitialized(true);
  };

  const handleBackToMode = () => {
    setShowContextSetup(false);
  };

  // Root level rendering logic
  if (!isInitialized) {
    if (showContextSetup) {
      return (
        <ContextSetup
          onBack={handleBackToMode}
          onComplete={handleContextComplete}
        />
      );
    }
    return <ModeSelection onSelect={handleModeSelect} />;
  }

  return (
    <MainLayout initialMode={mode} initialUserContext={userContext} />
  );
}

export default App;
