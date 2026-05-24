import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-mint">Fee Management</p>
          <h1 className="mt-2 text-4xl font-bold">Month-wise records</h1>
        </div>
        <button className="btn-outline flex items-center gap-2" onClick={downloadCsv}><Download size={18} /> Export CSV</button>
      </div>

      <section className="card mt-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input className="input" type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
          <button className="btn-primary" onClick={loadPayments}>Apply</button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="text-sm text-slate-400"><tr><th className="py-3">Student</th><th>Class</th><th>Month</th><th>Amount</th><th>Mode</th><th>Transaction</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-t border-line">
                  <td className="py-4">{payment.studentId?.name}</td>
                  <td>{payment.studentId?.class}</td>
                  <td>{payment.month}</td>
                  <td>{formatMoney(payment.amount)}</td>
                  <td>{payment.paymentMode}</td>
                  <td>{payment.transactionId}</td>
                  <td><StatusBadge status={payment.status} /></td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {loading && <tr><td className="py-5 text-slate-400">Loading...</td></tr>}
              {!loading && payments.length === 0 && <tr><td className="py-5 text-slate-400">No fee records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
};

export default FeeManagement;
