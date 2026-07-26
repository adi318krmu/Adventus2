import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Trash2, Edit, Download } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
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

      // Collect list of unique subjects
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
    if (!confirm("Are you sure you want to delete this study material?")) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success("Study Material Deleted");
      loadMaterials();
    } catch {
      toast.error("Failed to delete study material");
    }
  };

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
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <Shell type="admin">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-mint">Admin Console</p>
          <h1 className="text-4xl font-bold">Study Materials</h1>
          <p className="mt-1 text-slate-400">Upload and manage academic study documents, PDFs, and guides.</p>
        </div>
        <Link to="/admin/materials/upload" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Upload Material
        </Link>
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
            className="input md:w-44"
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
          <select
            className="input md:w-44"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="text-sm text-slate-400">
              <tr>
                <th className="py-3">Title</th>
                <th>Subject</th>
                <th>Class</th>
                <th>File Details</th>
                <th>Upload Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-5 text-slate-400">
                    Loading materials...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-5 text-slate-400">
                    No study materials found.
                  </td>
                </tr>
              ) : (
                materials.map((mat) => (
                  <tr key={mat._id} className="border-t border-line">
                    <td className="py-4">
                      <p className="font-semibold text-white">{mat.title}</p>
                      <p className="text-xs text-slate-400 max-w-sm truncate">{mat.description || "No description"}</p>
                    </td>
                    <td>
                      <span className="badge border-mint bg-mint/10 text-mint uppercase tracking-wider">{mat.subject}</span>
                    </td>
                    <td>Class {Array.isArray(mat.class) ? mat.class.join(", ") : mat.class}</td>
                    <td>
                      <p className="text-sm font-semibold max-w-xs truncate">{mat.fileName}</p>
                      <p className="text-xs text-slate-500">{mat.fileType}</p>
                    </td>
                    <td>{new Date(mat.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/materials/upload?editId=${mat._id}`}
                          className="btn-outline !py-2 !px-3"
                          title="Edit Material"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => downloadFile(mat._id, mat.fileName)}
                          className="btn-outline !py-2 !px-3"
                          title="Download File"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => deleteMaterial(mat._id)}
                          className="btn-outline !py-2 !px-3 hover:!border-rose-500 hover:!bg-rose-500/10 hover:!text-rose-500"
                          title="Delete Material"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
};

export default AdminStudyMaterials;
