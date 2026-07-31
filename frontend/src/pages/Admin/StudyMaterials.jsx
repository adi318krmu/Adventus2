import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Trash2, Edit, Download, Scroll } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import JapaneseDivider from "../../components/JapaneseDivider";
import api from "../../utils/api";
import { classes } from "../../utils/fees";

const AdminStudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [subjects, setSubjects] = useState([]);

  const loadMaterials = async () => {
    try {
      const query = new URLSearchParams({
        search,
        subject,
        class: studentClass
      }).toString();
      const { data } = await api.get(`/materials?${query}`);
      setMaterials(data);

      const allSubjects = await api.get("/materials");
      const uniqueSubjects = [...new Set(allSubjects.data.map((m) => m.subject))];
      setSubjects(uniqueSubjects);
    } catch {
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [search, subject, studentClass]);

  const deleteMaterial = async (id) => {
    if (!confirm("Are you sure you want to delete this scroll material?")) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success("Scroll material removed");
      loadMaterials();
    } catch {
      toast.error("Failed to delete study material");
    }
  };

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
    <Shell type="admin">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-amber-500/30 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
            <Scroll size={14} /> Academy Scrolls Repository
          </p>
          <h1 className="mt-1 text-3xl font-black font-display text-white">Study Materials Control</h1>
        </div>
        <Link to="/admin/materials/upload" className="btn-primary flex items-center gap-2 text-xs font-display uppercase tracking-wider !py-2.5 !px-4">
          <Plus size={16} /> Upload New Scroll
        </Link>
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
            className="input text-xs md:w-44"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="" className="bg-stone-900">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub} className="bg-stone-900">
                {sub}
              </option>
            ))}
          </select>
          <select
            className="input text-xs md:w-44"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
          >
            <option value="" className="bg-stone-900">All Class Ranks</option>
            {classes.map((cls) => (
              <option key={cls} value={cls} className="bg-stone-900">
                Class {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="card mt-6 border-amber-500/30 p-6 shadow-samuraiGold">
        <JapaneseDivider className="mb-6" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="font-display uppercase tracking-wider text-amber-400/90 border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Scroll Title</th>
                <th className="px-4">Subject</th>
                <th className="px-4">Class Rank</th>
                <th className="px-4">File Details</th>
                <th className="px-4">Archive Date</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    Loading scroll repository...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No study materials found in archives.
                  </td>
                </tr>
              ) : (
                materials.map((mat) => (
                  <tr key={mat._id} className="border-t border-amber-500/10 hover:bg-amber-500/5 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{mat.title}</p>
                      <p className="text-[11px] text-stone-400 max-w-sm truncate">{mat.description || "No description provided."}</p>
                    </td>
                    <td className="px-4">
                      <span className="badge border-amber-500/50 bg-amber-500/10 text-amber-400 font-display text-[10px] tracking-widest">{mat.subject}</span>
                    </td>
                    <td className="px-4 font-bold font-display text-amber-400">Class {Array.isArray(mat.class) ? mat.class.join(", ") : mat.class}</td>
                    <td className="px-4">
                      <p className="font-mono text-stone-300 max-w-xs truncate">{mat.fileName}</p>
                      <p className="text-[10px] text-stone-500 font-mono">{mat.fileType}</p>
                    </td>
                    <td className="px-4 text-stone-300">{new Date(mat.createdAt).toLocaleDateString()}</td>
                    <td className="px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/materials/upload?editId=${mat._id}`}
                          className="btn-outline !p-2"
                          title="Edit Scroll"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => downloadFile(mat._id, mat.fileName)}
                          className="btn-outline !p-2"
                          title="Download File"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => deleteMaterial(mat._id)}
                          className="rounded-xl border border-red-700/60 bg-red-950/40 p-2 text-red-300 hover:bg-red-900/60"
                          title="Delete Scroll"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
};

export default AdminStudyMaterials;
