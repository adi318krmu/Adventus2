const Brand = ({ size = "large" }) => {
  const isLarge = size === "large";
  return (
    <div className="flex items-center gap-4">
      <div className={`grid ${isLarge ? "h-20 w-20" : "h-12 w-12"} place-items-center overflow-hidden rounded-2xl border border-mint/40 bg-[#181818] transition-all duration-300`}>
        <img className="h-full w-full object-contain p-1.5" src="/adventus-logo.png" alt="ADVENTUS logo" />
      </div>
      <div>
        <div className={`font-display ${isLarge ? "text-4xl" : "text-2xl"} font-bold leading-none text-white transition-all duration-300`}>ADVENTUS</div>
        <div className={`mt-1.5 ${isLarge ? "text-xs" : "text-[10px]"} font-bold uppercase tracking-[0.35em] text-mint transition-all duration-300`}>
          {isLarge ? "Let's learn together & grow together" : "Learn & Grow Together"}
        </div>
      </div>
    </div>
  );
};

export default Brand;
