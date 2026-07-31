import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, History, UserRound, BookOpen, Mail, Phone, FileText, FileImage, File, Scroll, Award, Download } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import UserAvatar from "../components/UserAvatar";
import JapaneseDivider from "../components/JapaneseDivider";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { formatMoney } from "../utils/fees";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

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
      toast.success("Scroll File Download Started");
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
        {/* Main Dashboard Panel */}
        <section className="card lg:col-span-2 !p-6 flex flex-col justify-between border-amber-500/30">
          {/* Welcome Dojo Scroll Banner */}
          <div className="welcome-banner p-6 rounded-2xl border border-amber-500/40 relative overflow-hidden mb-6">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
                  <Award size={14} /> Student Dojo Dashboard
                </p>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 font-display">
                  Class {user?.class} Apprentice
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="p-1 rounded-2xl border-2 border-amber-500/60 bg-stone-900 shadow-samuraiGold">
                  <UserAvatar user={user} className="h-16 w-16 text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-2">
                    Greetings, {user?.name} <span className="animate-pulse">🌸</span>
                  </h1>
                  <p className="mt-1 text-xs text-stone-300">
                    Tuition ID: <span className="font-bold text-amber-400 font-mono">{user?.tuitionId || "Pending Generation"}</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-300">
                Your academic journey for Class {user?.class} is active. Maintain diligence in your studies and keep fees up to date.
              </p>
            </div>
          </div>
          
          {/* Quick Metrics Grid */}
          <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <UserRound size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Student</p>
              <p className="text-base font-bold truncate text-white">{user?.name}</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <BookOpen size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Class Rank</p>
              <p className="text-base font-bold text-white font-display">Class {user?.class}</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <History size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Fee Status</p>
              <div className="mt-1"><StatusBadge status={user?.feeStatus} /></div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <CreditCard size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Due Balance</p>
              <p className="text-base font-bold text-amber-400 font-display">{formatMoney(user?.feeStatus === "Paid" ? 0 : user?.feeAmount)}</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <CreditCard size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Last Payment</p>
              <p className="text-sm font-bold truncate text-white">{lastPayment}</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <Scroll size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Study Scrolls</p>
              <p className="text-base font-bold text-white font-display">{numMaterials}</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <Mail size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Email</p>
              <p className="text-xs font-bold truncate text-stone-200" title={user?.email}>{user?.email || "N/A"}</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-4 shadow-sm hover:border-amber-500/50 transition-all">
              <div className="icon-wrapper mb-2">
                <Phone size={18} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Phone</p>
              <p className="text-xs font-bold truncate text-stone-200" title={user?.phone}>{user?.phone || "N/A"}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-start">
            <Link to="/payment" className="btn-primary font-display uppercase tracking-wider text-xs inline-flex items-center justify-center gap-2 !px-6 !py-3">
              <CreditCard size={17} /> Submit Fee Payment
            </Link>
          </div>
        </section>

        {/* Study Scrolls Preview Panel */}
        <aside className="card !p-6 flex flex-col justify-between border-amber-500/30">
          <div>
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <h2 className="text-lg font-black font-display text-white flex items-center gap-2">
                <Scroll size={18} className="text-amber-400" /> Recent Study Scrolls
              </h2>
              <span className="text-xs font-bold text-amber-400 font-display">{materials.length} total</span>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="text-stone-400 text-xs py-4 text-center">Reading scroll archive...</p>
              ) : recentMaterials.length === 0 ? (
                <p className="text-stone-400 text-xs py-4 text-center">No study materials uploaded yet.</p>
              ) : (
                recentMaterials.map((mat) => {
                  const isPdf = mat.fileName?.toLowerCase().endsWith(".pdf") || mat.fileType?.toLowerCase().includes("pdf");
                  const isImage = mat.fileType?.toLowerCase().includes("image");
                  return (
                    <div key={mat._id} className="rounded-xl border border-amber-500/20 bg-stone-900/70 p-3.5 shadow-sm hover:border-amber-500/50 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isPdf ? (
                            <FileText className="text-red-400" size={18} />
                          ) : isImage ? (
                            <FileImage className="text-amber-400" size={18} />
                          ) : (
                            <File className="text-stone-400" size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate text-xs" title={mat.title}>{mat.title}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5">{mat.subject} • {new Date(mat.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex justify-between items-center">
                        <Link to={`/student/materials/${mat._id}`} className="text-xs font-bold font-display uppercase tracking-wider text-amber-400 hover:underline">
                          Read Scroll &rarr;
                        </Link>
                        <button onClick={() => downloadFile(mat._id, mat.fileName)} className="text-xs font-bold text-stone-300 hover:text-amber-300 flex items-center gap-1">
                          <Download size={13} /> Save
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {!loading && materials.length > 0 && (
            <Link to="/student/materials" className="btn-outline mt-6 block text-center text-xs font-display uppercase tracking-wider py-2.5">
              View All Academy Scrolls
            </Link>
          )}
        </aside>
      </div>

      {/* Payment History Table */}
      <section className="card mt-6 border-amber-500/30">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
          <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
            <History size={20} className="text-amber-400" /> Fee Payment Ledger
          </h2>
          <span className="text-xs text-stone-400 font-display uppercase tracking-wider">Hanko Certified Records</span>
        </div>

        <JapaneseDivider className="my-4" />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="font-display uppercase tracking-wider text-amber-400/90 border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Billing Month</th>
                <th className="px-4">Amount</th>
                <th className="px-4">Payment Method</th>
                <th className="px-4">Transaction Reference</th>
                <th className="px-4">Hanko Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-6 text-center text-stone-400">Loading ledger records...</td></tr>
              ) : history.map((payment) => (
                <tr key={payment._id} className="border-t border-amber-500/10 hover:bg-amber-500/5 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{payment.month}</td>
                  <td className="px-4 font-bold text-amber-400 font-display">{formatMoney(payment.amount)}</td>
                  <td className="px-4 text-stone-300">{payment.paymentMode}</td>
                  <td className="px-4 font-mono text-stone-400">{payment.transactionId}</td>
                  <td className="px-4"><StatusBadge status={payment.status} /></td>
                </tr>
              ))}
              {!loading && history.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-stone-400">No payment records found in ledger.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
};

export default StudentDashboard;
