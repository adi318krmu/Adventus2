import { useEffect, useState } from "react";
import api, { fileUrl } from "../utils/api";

const CreatorBranding = () => {
  const [brand, setBrand] = useState({
    text: "Aditya Singh • Kaizen Sensei",
    photo: ""
  });

  useEffect(() => {
    let mounted = true;
    api.get("/brand")
      .then(({ data }) => {
        if (mounted) setBrand({ text: data.text || brand.text, photo: data.photo || "" });
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="creator-branding pointer-events-none fixed bottom-3 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-mint/25 bg-ink/70 px-3 py-2 opacity-70 shadow-[0_0_22px_rgba(62,208,184,0.22)] backdrop-blur-md sm:bottom-5 sm:right-5 sm:px-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-mint/45 bg-panel text-xs font-black text-mint shadow-[0_0_14px_rgba(62,208,184,0.3)] sm:h-9 sm:w-9">
        {brand.photo ? (
          <img className="h-full w-full object-cover" src={fileUrl(brand.photo)} alt="" />
        ) : (
          <span>AS</span>
        )}
      </div>
      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-mint sm:text-xs">
        {brand.text}
      </p>
    </aside>
  );
};

export default CreatorBranding;
