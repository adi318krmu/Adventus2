import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, File } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import api from "../../utils/api";
import { classes } from "../../utils/fees";

const UploadMaterial = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editId = new URLSearchParams(location.search).get("editId");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    class: ["4"],
    file: null
  });

  useEffect(() => {
    if (editId) {
      setDetailsLoading(true);
      api
        .get(`/materials/${editId}`)
        .then(({ data }) => {
          setForm({
            title: data.title,
            description: data.description || "",
            subject: data.subject,
            class: Array.isArray(data.class) ? data.class : [data.class],
            file: null // Files cannot be prefilled
          });
        })
        .catch(() => {
          toast.error("Failed to load material details");
          navigate("/admin/materials");
        })
        .finally(() => setDetailsLoading(false));
    }
  }, [editId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, JPG, JPEG, and PNG files are allowed");
      e.target.value = "";
      return;
    }

    setForm({ ...form, file });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.class.length === 0) {
      return toast.error("Please select at least one class");
    }

    if (!editId && !form.file) {
      return toast.error("Please upload a file");
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("subject", form.subject);
      payload.append("class", form.class.join(","));
      if (form.file) payload.append("file", form.file);

      if (editId) {
        await api.put(`/materials/${editId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Study Material Updated");
      } else {
        await api.post("/materials", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Study Material Uploaded");
      }
      navigate("/admin/materials");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save study material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell type="admin">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/materials")}
          className="btn-outline flex items-center gap-2 !py-2 !px-3 text-sm mr-auto md:mr-0"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-3xl font-bold">
          {editId ? "Edit Study Material" : "Upload Study Material"}
        </h1>
      </div>

      <div className="card mt-6 max-w-2xl mx-auto">
        {detailsLoading ? (
          <p className="text-slate-400 text-center py-10">Loading study material details...</p>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Material Title
              </label>
              <input
                className="input"
                placeholder="Physics Chapter 1 Notes, Algebra Practice sheet, etc."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Description
              </label>
              <textarea
                className="input min-h-24 py-2"
                placeholder="Write a brief overview of the topics covered in this material..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Subject
                </label>
                <input
                  className="input"
                  placeholder="Physics, Chemistry, Maths..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Target Classes
                </label>
                <div className="flex items-center gap-3 mb-3 bg-panelSoft/30 p-2.5 rounded-xl border border-line">
                  <input
                    type="checkbox"
                    id="select-all-classes"
                    className="w-4 h-4 rounded border-line bg-panel text-mint focus:ring-mint accent-mint cursor-pointer"
                    checked={form.class.length === classes.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, class: [...classes] });
                      } else {
                        setForm({ ...form, class: [] });
                      }
                    }}
                  />
                  <label htmlFor="select-all-classes" className="text-sm font-semibold text-slate-200 cursor-pointer select-none">
                    Select All Classes
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {classes.map((cls) => {
                    const isChecked = form.class.includes(cls);
                    return (
                      <div key={cls} className="flex items-center gap-3 bg-panelSoft/30 p-2.5 rounded-xl border border-line hover:border-mint/50 transition">
                        <input
                          type="checkbox"
                          id={`class-${cls}`}
                          value={cls}
                          className="w-4 h-4 rounded border-line bg-panel text-mint focus:ring-mint accent-mint cursor-pointer"
                          checked={isChecked}
                          onChange={(e) => {
                            let updatedClasses = [...form.class];
                            if (e.target.checked) {
                              updatedClasses.push(cls);
                            } else {
                              updatedClasses = updatedClasses.filter((c) => c !== cls);
                            }
                            setForm({ ...form, class: updatedClasses });
                          }}
                        />
                        <label htmlFor={`class-${cls}`} className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
                          Class {cls}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                File Attachment (PDF, JPG, JPEG, PNG)
              </label>
              <div className="flex flex-col items-center justify-center border border-dashed border-line hover:border-mint/50 rounded-xl p-8 bg-ink/50 cursor-pointer relative transition">
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {form.file ? (
                  <div className="text-center">
                    <File size={32} className="text-mint mx-auto mb-2" />
                    <p className="font-semibold text-white text-sm">{form.file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(form.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={32} className="text-slate-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">Click or Drag & Drop File</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, JPEG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
              {editId && (
                <p className="text-xs text-slate-500 mt-2">
                  * Leave empty if you do not want to replace the current file.
                </p>
              )}
            </div>

            <button disabled={loading} className="btn-primary w-full mt-8">
              {loading ? "Saving material..." : editId ? "Update Study Material" : "Upload Study Material"}
            </button>
          </form>
        )}
      </div>
    </Shell>
  );
};

export default UploadMaterial;
