import { useState, useEffect, useRef } from "react";

export const useCompanion = () => {
  const [posX, setPosX] = useState(60);
  const [direction, setDirection] = useState(1); // 1 = facing right, -1 = facing left
  const [isWalking, setIsWalking] = useState(true);
  const [idleAction, setIdleAction] = useState(""); // "", "jump", "wave", "bounce"
  
  const stateRef = useRef({
    posX: 60,
    direction: 1,
    isWalking: true,
    idleAction: "",
    isPaused: false,
    nextPauseTime: Date.now() + 4000
  });

  const requestRef = useRef(null);

  useEffect(() => {
    // Determine speed based on screen size
    const getSpeed = () => {
      const w = window.innerWidth;
      if (w < 640) return 0.6; // Mobile: slower
      if (w < 1024) return 0.9; // Tablet
      return 1.3; // Desktop
    };

    const getMargins = () => {
      const w = window.innerWidth;
      const margin = w < 640 ? 15 : 40;
      const avatarW = w < 640 ? 48 : 64;
      const minX = margin;
      const maxX = Math.max(minX + 50, w - avatarW - margin);
      return { minX, maxX };
    };

    const updatePosition = () => {
      const state = stateRef.current;

      if (!state.isPaused && state.isWalking) {
        const speed = getSpeed();
        const { minX, maxX } = getMargins();

        let newX = state.posX + state.direction * speed;

        // Viewport bounds check - turn around when reaching edge
        if (newX >= maxX) {
          newX = maxX;
          state.direction = -1;
          setDirection(-1);
          // Brief pause on direction change for natural feel
          state.isWalking = false;
          setIsWalking(false);
          setTimeout(() => {
            state.isWalking = true;
            setIsWalking(true);
          }, 800);
        } else if (newX <= minX) {
          newX = minX;
          state.direction = 1;
          setDirection(1);
          state.isWalking = false;
          setIsWalking(false);
          setTimeout(() => {
            state.isWalking = true;
            setIsWalking(true);
          }, 800);
        }

        state.posX = newX;
        setPosX(newX);

        // Random pause / idle animation check
        if (Date.now() > state.nextPauseTime) {
          state.isWalking = false;
          setIsWalking(false);

          // Select random idle action
          const actions = ["jump", "wave", "bounce", "pause"];
          const chosenAction = actions[Math.floor(Math.random() * actions.length)];
          state.idleAction = chosenAction;
          setIdleAction(chosenAction);

          const pauseDuration = 2000 + Math.random() * 3000; // 2-5 seconds

          setTimeout(() => {
            state.idleAction = "";
            setIdleAction("");
            state.isWalking = true;
            setIsWalking(true);
            state.nextPauseTime = Date.now() + 5000 + Math.random() * 6000;
          }, pauseDuration);
        }
      }

      requestRef.current = requestAnimationFrame(updatePosition);
    };

    // Tab visibility check (pause when inactive)
    const handleVisibilityChange = () => {
      stateRef.current.isPaused = document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    requestRef.current = requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return {
    posX,
    direction,
    isWalking,
    idleAction
  };
};
