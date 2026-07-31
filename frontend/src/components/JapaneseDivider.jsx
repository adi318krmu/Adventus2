const JapaneseDivider = ({ className = "my-6" }) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="flex items-center gap-1.5 text-amber-500/70">
        <span className="h-1.5 w-1.5 rotate-45 border border-amber-500/60 bg-amber-500/20" />
        <span className="h-2.5 w-2.5 rotate-45 border border-amber-500 bg-amber-500/40" />
        <span className="h-1.5 w-1.5 rotate-45 border border-amber-500/60 bg-amber-500/20" />
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    </div>
  );
};

export default JapaneseDivider;
