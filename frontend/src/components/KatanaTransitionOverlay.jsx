import React, { useEffect, useState } from "react";

// Detailed Realistic Katana Vector SVG
const KatanaSvg = ({ isRight = false }) => {
  return (
    <svg
      viewBox="0 0 800 120"
      className={`w-[480px] sm:w-[650px] md:w-[750px] lg:w-[850px] h-auto filter drop-shadow-2xl ${
        isRight ? "scale-x-[-1]" : ""
      }`}
    >
      <defs>
        {/* Steel Blade Gradient */}
        <linearGradient id={`steelGrad-${isRight ? 'r' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>

        {/* Blade Hamon Edge Pattern */}
        <linearGradient id={`hamonGrad-${isRight ? 'r' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
        </linearGradient>

        {/* Gold Accent Gradient */}
        <linearGradient id={`goldGrad-${isRight ? 'r' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Handle Cord Wrap Gradient */}
        <linearGradient id={`wrapGrad-${isRight ? 'r' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="50%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={`katanaGlow-${isRight ? 'r' : 'l'}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Tsuka (Handle Core & Kashira Cap) */}
      <rect x="25" y="52" width="145" height="16" rx="8" fill="#18181b" stroke="#d97706" strokeWidth="1" />
      <rect x="20" y="50" width="14" height="20" rx="4" fill={`url(#goldGrad-${isRight ? 'r' : 'l'})`} />

      {/* Handle Diamond Cord Wrapping (Tsuka-ito) */}
      {[35, 52, 69, 86, 103, 120, 137, 154].map((x, i) => (
        <g key={i}>
          <polygon points={`${x},52 ${x + 10},60 ${x},68 ${x - 10},60`} fill={`url(#wrapGrad-${isRight ? 'r' : 'l'})`} stroke="#f59e0b" strokeWidth="0.5" />
          <circle cx={x} cy={60} r="1.5" fill="#fef08a" />
        </g>
      ))}

      {/* 2. Tsuba (Handguard) */}
      <ellipse cx="178" cy="60" rx="14" ry="34" fill={`url(#goldGrad-${isRight ? 'r' : 'l'})`} stroke="#fff" strokeWidth="1" filter={`url(#katanaGlow-${isRight ? 'r' : 'l'})`} />
      <ellipse cx="178" cy="60" rx="9" ry="24" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />

      {/* 3. Habaki (Blade Collar) */}
      <polygon points="186,49 204,47 204,73 186,71" fill={`url(#goldGrad-${isRight ? 'r' : 'l'})`} />

      {/* 4. Katana Main Steel Blade */}
      <path
        d="M 204 50 Q 480 47 780 32 L 795 44 Q 480 64 204 70 Z"
        fill={`url(#steelGrad-${isRight ? 'r' : 'l'})`}
        stroke="#ffffff"
        strokeWidth="0.75"
        filter={`url(#katanaGlow-${isRight ? 'r' : 'l'})`}
      />

      {/* Blade Spine Highlight Line */}
      <path
        d="M 204 52 Q 480 49 778 34"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Wave Hamon Edge Line */}
      <path
        d="M 204 67 Q 300 62 350 64 T 500 56 T 650 48 T 785 41"
        fill="none"
        stroke={`url(#hamonGrad-${isRight ? 'r' : 'l'})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
};

const KatanaTransitionOverlay = ({ message, onAnimationEnd }) => {
  const [phase, setPhase] = useState(0); 

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 50);
    const timer2 = setTimeout(() => setPhase(2), 580);
    const timer3 = setTimeout(() => setPhase(3), 880);
    const timer4 = setTimeout(() => setPhase(4), 1600);
    const timer5 = setTimeout(() => {
      if (onAnimationEnd) onAnimationEnd();
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onAnimationEnd]);

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
        phase === 4 ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at center, #0f172a 0%, #020617 70%, #000000 100%)"
      }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Screen Shake Container */}
      <div className={`relative w-full h-full flex items-center justify-center ${phase >= 2 ? "animate-katana-shake" : ""}`}>

        {/* LEFT KATANA */}
        <div
          className="absolute top-1/2 left-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform:
              phase === 0
                ? "translate(-140%, -40%) rotate(25deg)"
                : "translate(-14%, -50%) rotate(25deg)"
          }}
        >
          <KatanaSvg isRight={false} />
        </div>

        {/* RIGHT KATANA */}
        <div
          className="absolute top-1/2 left-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform:
              phase === 0
                ? "translate(140%, -40%) rotate(-25deg)"
                : "translate(14%, -50%) rotate(-25deg)"
          }}
        >
          <KatanaSvg isRight={true} />
        </div>

        {/* COLLISION METALLIC SPARK FLASH */}
        {phase >= 2 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-spark-flash z-30">
            <div className="w-44 h-44 rounded-full bg-gradient-to-r from-amber-300 via-white to-amber-500 blur-sm" />
          </div>
        )}

        {/* FULLSCREEN WHITE SLASH EFFECT */}
        {phase >= 2 && (
          <div className="absolute top-1/2 left-1/2 pointer-events-none animate-katana-slash z-40 h-3 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_40px_#ffffff,0_0_80px_#fbbf24]" />
        )}

        {/* GLOWING SPARK PARTICLES BURST */}
        {phase >= 2 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            {[...Array(24)].map((_, i) => {
              const angle = (i * 360) / 24;
              const distance = 80 + (i % 5) * 30;
              const size = 3 + (i % 3) * 2;
              return (
                <div
                  key={i}
                  className="absolute rounded-full bg-amber-300 shadow-[0_0_10px_#fbbf24]"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    transform: `rotate(${angle}deg) translate(${distance}px) scale(0)`,
                    animation: `sparkParticle 550ms ease-out forwards ${i * 12}ms`
                  }}
                />
              );
            })}
          </div>
        )}

        {/* TEXT BANNER REVEAL */}
        {phase >= 3 && (
          <div className="absolute z-50 text-center px-6 animate-katana-text">
            {/* Dojo Crest Emblem */}
            <div className="mx-auto mb-3 w-12 h-12 rounded-full border-2 border-amber-400/80 bg-amber-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              <span className="text-amber-400 text-lg font-black font-display">侍</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_0_25px_rgba(251,191,36,0.7)]">
              {message || "Entering Adventus Samurai Academy"}
            </h2>
            <p className="mt-2 text-xs font-bold font-display uppercase tracking-widest text-amber-300/80">
              Honorable Mastery & Excellence
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes sparkParticle {
          0% { transform: rotate(var(--angle, 0deg)) translate(0px) scale(1.5); opacity: 1; }
          100% { transform: rotate(var(--angle, 0deg)) translate(140px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default KatanaTransitionOverlay;
