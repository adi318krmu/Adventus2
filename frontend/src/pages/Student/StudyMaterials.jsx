import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
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

      // Collect list of unique subjects
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
    toast.success("File Download Started");
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
    } catch (error) {
      toast.error("Download failed");
    }
  };

  return (
    <Shell>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-mint">Student Hub</p>
          <h1 className="text-4xl font-bold">Study Materials</h1>
          <p className="mt-1 text-slate-400">Access academic files and reading notes assigned to your class.</p>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input
              className="input pl-10"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input md:w-56"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-slate-400">Loading study materials...</p>
        ) : materials.length === 0 ? (
          <p className="text-slate-400">No study materials found.</p>
        ) : (
          materials.map((mat) => (
            <div key={mat._id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="badge border-mint bg-mint/10 text-mint uppercase tracking-wider">{mat.subject}</span>
                  <span className="text-xs text-slate-500">{new Date(mat.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold mt-3 text-white truncate">{mat.title}</h3>
                <p className="text-slate-400 text-sm mt-2 line-clamp-3 h-12 leading-relaxed">
                  {mat.description || "No description provided."}
                </p>
              </div>
              <div className="mt-6 border-t border-line pt-4 flex items-center justify-between gap-3">
                <Link
                  to={`/student/materials/${mat._id}`}
                  className="btn-outline flex items-center gap-2 !py-2 !px-4 text-sm"
                >
                  <Eye size={16} /> View
                </Link>
                <button
                  onClick={() => downloadFile(mat._id, mat.fileName)}
                  className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm"
                >
                  <Download size={16} /> Download
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
