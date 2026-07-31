import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload, File, Scroll } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import JapaneseDivider from "../../components/JapaneseDivider";
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
            file: null
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
        toast.success("Study Scroll Updated");
      } else {
        await api.post("/materials", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Study Scroll Uploaded");
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
      <div className="flex items-center gap-4 border-b border-amber-500/30 pb-5">
        <button
          onClick={() => navigate("/admin/materials")}
          className="btn-outline flex items-center gap-2 !py-2 !px-3.5 text-xs font-display uppercase tracking-wider mr-auto md:mr-0"
        >
          <ArrowLeft size={16} /> Return to Archives
        </button>
        <h1 className="text-2xl font-black font-display text-white">
          {editId ? "Edit Study Scroll" : "Upload New Academic Scroll"}
        </h1>
      </div>

      <div className="card mt-6 max-w-2xl mx-auto border-amber-500/40 p-8 shadow-samuraiGold">
        {detailsLoading ? (
          <p className="text-stone-400 text-xs text-center py-10">Reading scroll details...</p>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">
                Scroll Title
              </label>
              <input
                className="input text-xs"
                placeholder="Physics Chapter 1 Notes, Algebra Practice sheet, etc."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">
                Scroll Description / Overview
              </label>
              <textarea
                className="input min-h-24 text-xs py-2"
                placeholder="Write a brief overview of the topics covered in this material..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">
                  Subject Category
                </label>
                <input
                  className="input text-xs"
                  placeholder="Physics, Chemistry, Maths..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-2">
                  Class Access Rights
                </label>
                <div className="flex items-center gap-3 mb-3 bg-stone-950 p-2.5 rounded-xl border border-amber-500/30">
                  <input
                    type="checkbox"
                    id="select-all-classes"
                    className="w-4 h-4 rounded border-amber-500/40 bg-stone-900 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                    checked={form.class.length === classes.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, class: [...classes] });
                      } else {
                        setForm({ ...form, class: [] });
                      }
                    }}
                  />
                  <label htmlFor="select-all-classes" className="text-xs font-bold uppercase font-display tracking-wider text-stone-200 cursor-pointer select-none">
                    Select All Class Ranks
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {classes.map((cls) => {
                    const isChecked = form.class.includes(cls);
                    return (
                      <div key={cls} className="flex items-center gap-2 bg-stone-950 p-2 rounded-xl border border-amber-500/20 hover:border-amber-500/50 transition">
                        <input
                          type="checkbox"
                          id={`class-${cls}`}
                          value={cls}
                          className="w-4 h-4 rounded border-amber-500/40 bg-stone-900 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
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
                        <label htmlFor={`class-${cls}`} className="text-xs font-bold font-display text-stone-300 cursor-pointer select-none">
                          Class {cls}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-2">
                File Attachment (PDF, JPG, JPEG, PNG)
              </label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-amber-500/30 hover:border-amber-500/70 rounded-2xl p-8 bg-stone-950 cursor-pointer relative transition">
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {form.file ? (
                  <div className="text-center">
                    <File size={32} className="text-amber-400 mx-auto mb-2" />
                    <p className="font-bold text-white text-xs font-mono">{form.file.name}</p>
                    <p className="text-[10px] text-stone-400 mt-1 font-mono">{(form.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={32} className="text-stone-500 mx-auto mb-2" />
                    <p className="text-xs font-bold font-display uppercase tracking-wider text-stone-200">Click or Drag & Drop File</p>
                    <p className="text-[11px] text-stone-400 mt-1 font-mono">PDF, JPG, JPEG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
              {editId && (
                <p className="text-[11px] text-stone-400 mt-2">
                  * Leave empty if you do not want to replace the current scroll file.
                </p>
              )}
            </div>

            <button disabled={loading} className="btn-primary w-full mt-6 font-display uppercase tracking-wider text-xs py-3.5">
              {loading ? "Saving Scroll Material..." : editId ? "Update Study Scroll" : "Publish Study Scroll"}
            </button>
          </form>
        )}
      </div>
    </Shell>
  );
};

export default UploadMaterial;
