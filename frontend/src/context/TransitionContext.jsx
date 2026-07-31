import React, { createContext, useContext, useState, useCallback } from "react";
import KatanaTransitionOverlay from "../components/KatanaTransitionOverlay";

const TransitionContext = createContext(null);

export const TransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [message, setMessage] = useState("Entering Adventus Samurai Academy");
  const [onCompleteCallback, setOnCompleteCallback] = useState(null);

  const triggerKatanaTransition = useCallback(({ message = "Entering Adventus Samurai Academy", onComplete } = {}) => {
    setMessage(message);
    setOnCompleteCallback(() => onComplete);
    setIsTransitioning(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setIsTransitioning(false);
    if (onCompleteCallback) {
      onCompleteCallback();
      setOnCompleteCallback(null);
    }
  }, [onCompleteCallback]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, triggerKatanaTransition }}>
      {children}
      {isTransitioning && (
        <KatanaTransitionOverlay message={message} onAnimationEnd={handleAnimationEnd} />
      )}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }
  return context;
};
