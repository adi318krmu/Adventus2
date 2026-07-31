const Brand = ({ size = "large" }) => {
  const isLarge = size === "large";
  return (
    <div className="flex items-center gap-3.5 select-none">
      <div className={`grid ${isLarge ? "h-20 w-20" : "h-12 w-12"} place-items-center overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-indigo-950 to-stone-950 p-1 shadow-samuraiGold transition-all duration-300 relative group`}>
        <div className="absolute inset-0 bg-amber-500/10 blur-sm group-hover:opacity-100 transition-opacity" />
        <img className="relative z-10 h-full w-full object-contain p-1" src="/adventus-logo.png" alt="ADVENTUS logo" />
      </div>
      <div>
        <div className={`font-display ${isLarge ? "text-3xl md:text-4xl" : "text-xl"} font-black tracking-wider leading-none text-white flex items-center gap-2`}>
          ADVENTUS
        </div>
        <div className={`mt-1.5 ${isLarge ? "text-xs" : "text-[10px]"} font-bold uppercase tracking-[0.25em] text-amber-500 flex items-center gap-1.5`}>
          <span className="inline-block h-1 w-1 rounded-full bg-red-600" />
          {isLarge ? "SAMURAI ACADEMY • LEARN & GROW TOGETHER" : "SAMURAI ACADEMY"}
        </div>
      </div>
    </div>
  );
};

export default Brand;
