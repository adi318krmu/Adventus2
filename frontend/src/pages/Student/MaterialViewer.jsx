import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
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
      .catch(() => {
        toast.error("Failed to load study material preview");
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
    toast.success("File Download Started");
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
    } catch {
      toast.error("Download failed");
    }
  };

  const isImage = material?.fileType?.startsWith("image/");
  const isPdf = material?.fileType === "application/pdf";

  return (
    <Shell>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Link to="/student/materials" className="btn-outline flex items-center gap-2 !py-2 !px-3 text-sm mr-auto md:mr-0">
          <ArrowLeft size={16} /> Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold truncate max-w-xl">{material?.title || "Loading Preview..."}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {material?.subject} • Uploaded on {material && new Date(material.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button onClick={downloadFile} className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm ml-auto">
          <Download size={16} /> Download File
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr] mt-6">
        <section className="card flex items-center justify-center min-h-[500px]">
          {loading ? (
            <p className="text-slate-400">Loading document viewer...</p>
          ) : isImage ? (
            <img
              src={blobUrl}
              alt={material.title}
              className="max-w-full max-h-[70vh] rounded-xl object-contain border border-line shadow-glow"
            />
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              title={material.title}
              className="w-full h-[70vh] rounded-xl border border-line bg-panelSoft"
            />
          ) : (
            <div className="text-center">
              <BookOpen size={48} className="text-slate-500 mx-auto" />
              <p className="text-slate-400 mt-3">Preview not supported for this file format.</p>
              <button onClick={downloadFile} className="btn-outline mt-4 inline-block">Download to view</button>
            </div>
          )}
        </section>

        <aside className="card flex flex-col gap-5 h-fit">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-mint">File Description</h3>
            <p className="text-slate-300 mt-3 text-sm leading-relaxed whitespace-pre-line">
              {material?.description || "No description provided for this material."}
            </p>
          </div>
          <div className="border-t border-line pt-4 space-y-3 text-sm text-slate-400">
            <p><span className="text-slate-500">File Name:</span> {material?.fileName}</p>
            <p><span className="text-slate-500">File Type:</span> {material?.fileType}</p>
            <p><span className="text-slate-500">Class Assigned:</span> Class {material?.class}</p>
          </div>
        </aside>
      </div>
    </Shell>
  );
};

export default MaterialViewer;
