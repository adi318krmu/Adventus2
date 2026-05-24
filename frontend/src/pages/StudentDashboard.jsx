import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, History, UserRound } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { fileUrl } from "../utils/api";
import { formatMoney } from "../utils/fees";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/payment/history").then(({ data }) => setHistory(data)).finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
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
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-line p-5"><UserRound className="text-mint" /><p className="mt-4 text-sm text-slate-400">Class</p><p className="text-2xl font-bold">{user?.class}</p></div>
            <div className="rounded-xl border border-line p-5"><CreditCard className="text-mint" /><p className="mt-4 text-sm text-slate-400">Monthly Fee</p><p className="text-2xl font-bold">{formatMoney(user?.feeAmount)}</p></div>
            <div className="rounded-xl border border-line p-5"><History className="text-mint" /><p className="mt-4 text-sm text-slate-400">Status</p><div className="mt-2"><StatusBadge status={user?.feeStatus} /></div></div>
          </div>
          <Link to="/payment" className="btn-primary mt-8 inline-block">Submit Payment</Link>
        </section>
        <aside className="card">
          <h2 className="text-xl font-bold">Profile</h2>
          <div className="mt-5 space-y-4 text-slate-300">
            <p><span className="text-slate-500">Username:</span> {user?.username}</p>
            <p><span className="text-slate-500">Tuition ID:</span> {user?.tuitionId || "Not generated yet"}</p>
            <p><span className="text-slate-500">Full Name:</span> {user?.name}</p>
            <p><span className="text-slate-500">Class:</span> {user?.class}</p>
          </div>
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
