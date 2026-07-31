import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Scroll, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import JapaneseDivider from "../../components/JapaneseDivider";
import api from "../../utils/api";

const MaterialViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [blobUrl, setBlobUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activeBlobUrl = "";

    api
      .get(`/materials/${id}`)
      .then(({ data }) => {
        setMaterial(data);
        return api.get(`/materials/download/${id}`, { responseType: "blob" });
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: res.headers["content-type"] });
        activeBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(activeBlobUrl);
      })
      .catch(async (err) => {
        let msg = "Failed to load study material preview";
        if (err?.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const parsed = JSON.parse(text);
            if (parsed?.message) msg = parsed.message;
          } catch {}
        }
        toast.error(msg);
        navigate("/student/materials");
      })
      .finally(() => setLoading(false));

    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [id, navigate]);

  const downloadFile = async () => {
    if (!material) return;
    try {
      const { data } = await api.get(`/materials/download/${id}?download=true`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", material.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Scroll file download started");
    } catch (error) {
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) {
            toast.error(parsed.message);
            return;
          }
        } catch {}
      }
      toast.error("Download failed. File may no longer exist on server.");
    }
  };

  const isImage = material?.fileType?.startsWith("image/");
  const isPdf = material?.fileType === "application/pdf";

  return (
    <Shell>
      <div className="flex flex-col gap-4 md:flex-row md:items-center border-b border-amber-500/30 pb-5">
        <Link to="/student/materials" className="btn-outline flex items-center gap-2 !py-2 !px-3.5 text-xs font-display uppercase tracking-wider mr-auto md:mr-0">
          <ArrowLeft size={16} /> Return to Archives
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black font-display text-white truncate">{material?.title || "Reading Academic Scroll..."}</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Subject: <strong className="text-amber-400 font-display">{material?.subject}</strong> • Uploaded on {material && new Date(material.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button onClick={downloadFile} className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-xs font-display uppercase tracking-wider ml-auto">
          <Download size={16} /> Download Scroll File
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr] mt-6">
        <section className="card border-amber-500/40 p-4 flex items-center justify-center min-h-[520px] shadow-samuraiGold">
          {loading ? (
            <p className="text-stone-400 text-xs py-8">Unrolling scroll preview...</p>
          ) : isImage ? (
            <img
              src={blobUrl}
              alt={material.title}
              className="max-w-full max-h-[70vh] rounded-xl object-contain border border-amber-500/40 shadow-samuraiGold"
            />
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              title={material.title}
              className="w-full h-[70vh] rounded-xl border border-amber-500/40 bg-stone-950"
            />
          ) : (
            <div className="text-center p-8">
              <Scroll size={48} className="text-amber-400/80 mx-auto" />
              <p className="text-stone-300 font-display text-sm mt-3">Direct preview is restricted for this file format.</p>
              <button onClick={downloadFile} className="btn-primary mt-4 inline-flex items-center gap-2 text-xs font-display uppercase tracking-wider py-2.5 px-5">
                <Download size={15} /> Download to View Document
              </button>
            </div>
          )}
        </section>

        <aside className="card border-amber-500/30 p-6 flex flex-col gap-5 h-fit shadow-samurai">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
              <BookOpen size={14} /> Scroll Metadata
            </h3>
            <JapaneseDivider className="my-3" />
            <p className="text-stone-200 text-xs leading-relaxed whitespace-pre-line">
              {material?.description || "No description provided for this scroll."}
            </p>
          </div>

          <div className="border-t border-amber-500/20 pt-4 space-y-2.5 text-xs text-stone-300 font-mono">
            <p><span className="text-stone-400 font-display uppercase font-bold text-[11px]">File:</span> {material?.fileName}</p>
            <p><span className="text-stone-400 font-display uppercase font-bold text-[11px]">Type:</span> {material?.fileType}</p>
            <p><span className="text-stone-400 font-display uppercase font-bold text-[11px]">Class Access:</span> Class {Array.isArray(material?.class) ? material.class.join(", ") : material?.class}</p>
          </div>
        </aside>
      </div>
    </Shell>
  );
};

export default MaterialViewer;
