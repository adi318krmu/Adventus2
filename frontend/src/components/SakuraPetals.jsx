import { useMemo } from "react";

const SakuraPetals = () => {
  // Generate a small fixed array of petal metadata for smooth, lightweight animation
  const petals = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${(i * 8.3 + 3) % 95}%`,
      size: `${10 + (i % 5) * 3}px`,
      duration: `${9 + (i % 6) * 2.5}s`,
      delay: `${(i % 5) * 1.8}s`,
      opacity: 0.3 + (i % 4) * 0.12
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((petal) => (
        <svg
          key={petal.id}
          className="sakura-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            opacity: petal.opacity
          }}
          viewBox="0 0 30 30"
          fill="none"
        >
          {/* Subtle Sakura Petal Shape */}
          <path
            d="M15 2C15 2 24 8 24 16C24 21 20 27 15 27C10 27 6 21 6 16C6 8 15 2 15 2Z"
            fill="#F472B6"
            fillOpacity="0.7"
          />
          <path
            d="M15 5C15 5 21 10 21 16C21 19.5 18 24 15 24C12 24 9 19.5 9 16C9 10 15 5 15 5Z"
            fill="#FB7185"
            fillOpacity="0.5"
          />
        </svg>
      ))}
    </div>
  );
};

export default SakuraPetals;
