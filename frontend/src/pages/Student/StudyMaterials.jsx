import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Scroll, Download, Eye, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import JapaneseDivider from "../../components/JapaneseDivider";
import api from "../../utils/api";

const StudentStudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);

  const loadMaterials = async () => {
    try {
      const query = new URLSearchParams({ search, subject }).toString();
      const { data } = await api.get(`/materials?${query}`);
      setMaterials(data);

      if (subjects.length === 0) {
        const uniqueSubjects = [...new Set(data.map((m) => m.subject))];
        setSubjects(uniqueSubjects);
      }
    } catch {
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [search, subject]);

  const downloadFile = async (id, fileName) => {
    try {
      const { data } = await api.get(`/materials/download/${id}?download=true`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
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

  return (
    <Shell>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-amber-500/30 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
            <Scroll size={14} /> Academy Archive
          </p>
          <h1 className="mt-1 text-3xl font-black font-display text-white">Scrolls of Wisdom</h1>
        </div>
      </div>

      <div className="card mt-6 border-amber-500/30 p-5 shadow-samuraiGold">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-stone-500" size={16} />
            <input
              className="input pl-9 text-xs"
              placeholder="Search scrolls by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input text-xs md:w-56"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="" className="bg-stone-900">All Academic Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub} className="bg-stone-900">
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-stone-400 text-xs py-8 col-span-full text-center">Unrolling academic scroll repository...</p>
        ) : materials.length === 0 ? (
          <p className="text-stone-400 text-xs py-8 col-span-full text-center">No study materials found in archives.</p>
        ) : (
          materials.map((mat) => (
            <div key={mat._id} className="card border-amber-500/30 p-6 shadow-samuraiGold flex flex-col justify-between hover:border-amber-500/60 transition">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="badge border-amber-500/50 bg-amber-500/10 text-amber-400 font-display text-[10px] tracking-widest">{mat.subject}</span>
                  <span className="text-[11px] text-stone-400">{new Date(mat.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-black font-display mt-3 text-white truncate" title={mat.title}>{mat.title}</h3>
                <p className="text-stone-300 text-xs mt-2 line-clamp-3 leading-relaxed">
                  {mat.description || "No scroll description provided."}
                </p>
              </div>
              <div className="mt-6 border-t border-amber-500/20 pt-4 flex items-center justify-between gap-3">
                <Link
                  to={`/student/materials/${mat._id}`}
                  className="btn-outline flex items-center gap-1.5 !py-2 !px-3.5 text-xs font-display uppercase tracking-wider"
                >
                  <Eye size={14} /> Read Scroll
                </Link>
                <button
                  onClick={() => downloadFile(mat._id, mat.fileName)}
                  className="btn-primary flex items-center gap-1.5 !py-2 !px-3.5 text-xs font-display uppercase tracking-wider"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Shell>
  );
};

export default StudentStudyMaterials;
