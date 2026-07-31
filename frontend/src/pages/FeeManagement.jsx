import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, CreditCard } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import JapaneseDivider from "../components/JapaneseDivider";
import api from "../utils/api";
import { formatMoney } from "../utils/fees";

const FeeManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({ status: "", month: "" });
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/admin/payments?${query}`);
      setPayments(data);
    } catch {
      toast.error("Unable to load fee records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const downloadCsv = async () => {
    const { data } = await api.get("/admin/export/fees.csv", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "fee-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell type="admin">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-amber-500/30 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
            <CreditCard size={14} /> Treasury Archives
          </p>
          <h1 className="mt-1 text-3xl font-black font-display text-white">Fee Record Audit Ledger</h1>
        </div>
        <button className="btn-outline flex items-center gap-2 text-xs font-display uppercase tracking-wider !py-2.5 !px-4" onClick={downloadCsv}>
          <Download size={16} /> Export Treasury CSV
        </button>
      </div>

      <section className="card mt-6 border-amber-500/30 p-6 shadow-samuraiGold">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Filter Month</label>
            <input className="input text-xs" type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Filter Hanko Status</label>
            <select className="input text-xs" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="" className="bg-stone-900">All Statuses</option>
              <option value="Pending" className="bg-stone-900">Pending</option>
              <option value="Accepted" className="bg-stone-900">Accepted</option>
              <option value="Rejected" className="bg-stone-900">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary text-xs font-display uppercase tracking-wider w-full md:w-auto !py-3 !px-6" onClick={loadPayments}>
              Filter Ledger
            </button>
          </div>
        </div>

        <JapaneseDivider className="my-6" />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="font-display uppercase tracking-wider text-amber-400/90 border-b border-amber-500/30">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="px-4">Class</th>
                <th className="px-4">Month</th>
                <th className="px-4">Amount</th>
                <th className="px-4">Method</th>
                <th className="px-4">Transaction Ref</th>
                <th className="px-4">Hanko Status</th>
                <th className="px-4">Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-t border-amber-500/10 hover:bg-amber-500/5 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{payment.studentId?.name}</td>
                  <td className="px-4 font-bold font-display text-amber-400">Class {payment.studentId?.class}</td>
                  <td className="px-4 text-stone-300">{payment.month}</td>
                  <td className="px-4 font-bold text-amber-400 font-display">{formatMoney(payment.amount)}</td>
                  <td className="px-4 text-stone-300">{payment.paymentMode}</td>
                  <td className="px-4 font-mono text-stone-400">{payment.transactionId}</td>
                  <td className="px-4"><StatusBadge status={payment.status} /></td>
                  <td className="px-4 text-stone-400">{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {loading && <tr><td colSpan={8} className="py-6 text-center text-stone-400">Loading ledger records...</td></tr>}
              {!loading && payments.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-stone-400">No fee records found in treasury archive.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
};

export default FeeManagement;
