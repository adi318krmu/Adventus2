const Brand = () => (
  <div className="flex items-center gap-4">
    <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-mint/40 bg-[#181818]">
      <img className="h-full w-full object-contain p-1" src="/adventus-logo.png" alt="ADVENTUS logo" />
    </div>
    <div>
      <div className="font-display text-3xl font-bold leading-none text-white">ADVENTUS</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.35em] text-mint">Let's learn together & grow together</div>
    </div>
  </div>
);

export default Brand;
