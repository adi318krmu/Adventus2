import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { CreditCard, History, UserRound, BookOpen, X, Mail, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
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

  const lastAccepted = history.find((p) => p.status === "Accepted");
  const lastPayment = lastAccepted ? `${formatMoney(lastAccepted.amount)} (${lastAccepted.month})` : "None";
  const numMaterials = materials.length;
  const recentMaterials = materials.slice(0, 3);

  return (
    <Shell>


      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2 welcome-card">
          <p className="text-mint">Student Dashboard</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-mint/50 bg-ink text-2xl font-bold text-mint">
              {user?.profilePhoto ? <img className="h-full w-full object-cover" src={fileUrl(user.profilePhoto)} alt="Student profile" /> : user?.name?.[0]}
            </div>
            <div>
              <h1 className="text-4xl font-bold">Welcome, {user?.name}</h1>
              <p className="mt-1 text-slate-400">Tuition ID: <span className="font-semibold text-mint">{user?.tuitionId || "Generated after profile save"}</span></p>
            </div>
          </div>
          <p className="mt-3 text-slate-400">Class {user?.class} monthly fee is ready for this billing cycle.</p>
          
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-mint mb-3">
                <UserRound size={20} />
              </div>
              <p className="text-sm text-slate-400">Student Name</p>
              <p className="text-lg font-bold truncate">{user?.name}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-lavender mb-3">
                <BookOpen size={20} />
              </div>
              <p className="text-sm text-slate-400">Class</p>
              <p className="text-lg font-bold">Class {user?.class}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-yellow mb-3">
                <History size={20} />
              </div>
              <p className="text-sm text-slate-400">Fee Status</p>
              <div className="mt-1"><StatusBadge status={user?.feeStatus} /></div>
            </div>
            <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-coral mb-3">
                <CreditCard size={20} />
              </div>
              <p className="text-sm text-slate-400">Pending Fees</p>
              <p className="text-lg font-bold">{formatMoney(user?.feeStatus === "Paid" ? 0 : user?.feeAmount)}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-blue mb-3">
                <CreditCard size={20} />
              </div>
              <p className="text-sm text-slate-400">Last Payment</p>
              <p className="text-lg font-bold truncate">{lastPayment}</p>
            </div>
             <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-green mb-3">
                <BookOpen size={20} />
              </div>
              <p className="text-sm text-slate-400">Study Materials</p>
              <p className="text-lg font-bold">{numMaterials}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-purple mb-3">
                <Mail size={20} />
              </div>
              <p className="text-sm text-slate-400">Email Address</p>
              <p className="text-lg font-bold truncate" title={user?.email}>{user?.email || "No Email"}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <div className="icon-wrapper icon-cyan mb-3">
                <UserRound size={20} />
              </div>
              <p className="text-sm text-slate-400">Phone Number</p>
              <p className="text-lg font-bold truncate" title={user?.phone}>{user?.phone || "No Phone"}</p>
            </div>
          </div>
          <Link to="/payment" className="btn-primary mt-8 inline-block">Submit Payment</Link>
        </section>

        <aside className="card flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-mint">Recent Study Materials</h2>
            <div className="mt-5 space-y-4">
              {loading ? (
                <p className="text-slate-400 text-sm">Loading...</p>
              ) : recentMaterials.length === 0 ? (
                <p className="text-slate-400 text-sm">No study materials uploaded yet.</p>
              ) : (
                recentMaterials.map((mat) => (
                  <div key={mat._id} className="rounded-xl border border-line bg-panelSoft/50 p-4">
                    <p className="font-semibold text-white truncate">{mat.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{mat.subject} • {new Date(mat.createdAt).toLocaleDateString()}</p>
                    <div className="mt-3 flex gap-2">
                      <Link to={`/student/materials/${mat._id}`} className="text-xs font-bold text-mint hover:underline">View</Link>
                      <button onClick={() => downloadFile(mat._id, mat.fileName)} className="text-xs font-bold text-slate-400 hover:text-white ml-auto">Download</button>
                    </div>
                  </div>
                ))
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
