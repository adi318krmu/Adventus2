import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { CreditCard, History, UserRound, BookOpen, X, Mail, ShieldAlert, FileText, FileImage, File } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import api, { fileUrl } from "../utils/api";
import { formatMoney } from "../utils/fees";

const StudentDashboard = () => {
  const { user, setUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // No verification state needed for student dashboard

  useEffect(() => {
    Promise.all([
      api.get("/payment/history"),
      api.get("/materials")
    ])
      .then(([historyRes, materialsRes]) => {
        setHistory(historyRes.data);
        setMaterials(materialsRes.data);
      })
      .catch(() => toast.error("Unable to load student data"))
      .finally(() => setLoading(false));
  }, []);

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
      toast.success("File Download Started");
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

  const lastAccepted = history.find((p) => p.status === "Accepted");
  const lastPayment = lastAccepted ? `${formatMoney(lastAccepted.amount)} (${lastAccepted.month})` : "None";
  const numMaterials = materials.length;
  const recentMaterials = materials.slice(0, 3);

  return (
    <Shell>


      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2 !p-6 flex flex-col justify-between">
          <div className="welcome-banner p-6 rounded-2xl border border-line relative overflow-hidden mb-6">
            <div className="absolute inset-0 opacity-20 pointer-events-none welcome-bg"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-wider text-mint">Student Dashboard</p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                <UserAvatar user={user} className="h-16 w-16 text-2xl shadow-glow" />
                <div>
                  <h1 className="text-3xl font-black text-white flex items-center gap-2">Welcome, {user?.name} <span className="animate-bounce">👋</span></h1>
                  <p className="mt-1 text-sm text-slate-400">Tuition ID: <span className="font-semibold text-mint">{user?.tuitionId || "Generated after profile save"}</span></p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300">Class {user?.class} monthly fee is ready for this billing cycle.</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-mint mb-3">
                <UserRound size={20} />
              </div>
              <p className="text-sm text-slate-400">Student Name</p>
              <p className="text-lg font-bold truncate text-white">{user?.name}</p>
            </div>
            <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-lavender mb-3">
                <BookOpen size={20} />
              </div>
              <p className="text-sm text-slate-400">Class</p>
              <p className="text-lg font-bold text-white">Class {user?.class}</p>
            </div>
            <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-yellow mb-3">
                <History size={20} />
              </div>
              <p className="text-sm text-slate-400">Fee Status</p>
              <div className="mt-1"><StatusBadge status={user?.feeStatus} /></div>
            </div>
            <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-coral mb-3">
                <CreditCard size={20} />
              </div>
              <p className="text-sm text-slate-400">Pending Fees</p>
              <p className="text-lg font-bold text-white">{formatMoney(user?.feeStatus === "Paid" ? 0 : user?.feeAmount)}</p>
            </div>
            <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-blue mb-3">
                <CreditCard size={20} />
              </div>
              <p className="text-sm text-slate-400">Last Payment</p>
              <p className="text-lg font-bold truncate text-white">{lastPayment}</p>
            </div>
             <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-green mb-3">
                <BookOpen size={20} />
              </div>
              <p className="text-sm text-slate-400">Study Materials</p>
              <p className="text-lg font-bold text-white">{numMaterials}</p>
            </div>
            <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-purple mb-3">
                <Mail size={20} />
              </div>
              <p className="text-sm text-slate-400">Email Address</p>
              <p className="text-lg font-bold truncate text-white" title={user?.email}>{user?.email || "No Email"}</p>
            </div>
            <div className="rounded-xl border border-line p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
              <div className="icon-wrapper icon-cyan mb-3">
                <UserRound size={20} />
              </div>
              <p className="text-sm text-slate-400">Phone Number</p>
              <p className="text-lg font-bold truncate text-white" title={user?.phone}>{user?.phone || "No Phone"}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-start">
            <Link to="/payment" className="btn-primary inline-flex items-center justify-center gap-2 shadow-md hover:translate-y-[-1px] active:translate-y-[0px] !px-6 !py-3">
              <CreditCard size={18} /> Submit Payment
            </Link>
          </div>
        </section>

        <aside className="card !p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-mint">Recent Study Materials</h2>
            <div className="mt-5 space-y-4">
              {loading ? (
                <p className="text-slate-400 text-sm">Loading...</p>
              ) : recentMaterials.length === 0 ? (
                <p className="text-slate-400 text-sm">No study materials uploaded yet.</p>
              ) : (
                recentMaterials.map((mat) => {
                  const isPdf = mat.fileName?.toLowerCase().endsWith(".pdf") || mat.fileType?.toLowerCase().includes("pdf");
                  const isImage = mat.fileType?.toLowerCase().includes("image");
                  return (
                    <div key={mat._id} className="rounded-xl border border-line bg-panelSoft/10 p-4 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isPdf ? (
                            <FileText className="text-red-500" size={20} />
                          ) : isImage ? (
                            <FileImage className="text-mint" size={20} />
                          ) : (
                            <File className="text-slate-400" size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate text-sm" title={mat.title}>{mat.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{mat.subject} • {new Date(mat.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-line/30 flex justify-between items-center">
                        <Link to={`/student/materials/${mat._id}`} className="text-xs font-semibold text-mint hover:underline">
                          View
                        </Link>
                        <button onClick={() => downloadFile(mat._id, mat.fileName)} className="text-xs font-semibold text-mint hover:underline flex items-center gap-1">
                          Download &darr;
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {!loading && materials.length > 0 && (
            <Link to="/student/materials" className="btn-outline mt-6 block text-center text-xs">View All Materials</Link>
          )}
        </aside>
      </div>

      <section className="card mt-6">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="text-sm text-slate-400"><tr><th className="py-3">Month</th><th>Amount</th><th>Mode</th><th>Transaction</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? <tr><td className="py-4 text-slate-400">Loading...</td></tr> : history.map((payment) => (
                <tr key={payment._id} className="border-t border-line"><td className="py-4">{payment.month}</td><td>{formatMoney(payment.amount)}</td><td>{payment.paymentMode}</td><td>{payment.transactionId}</td><td><StatusBadge status={payment.status} /></td></tr>
              ))}
              {!loading && history.length === 0 && <tr><td className="py-4 text-slate-400">No payment records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>


    </Shell>
  );
};

export default StudentDashboard;
