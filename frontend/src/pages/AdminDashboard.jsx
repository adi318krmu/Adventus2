import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, Download, Pencil, Search, Trash2, X } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { fileUrl } from "../utils/api";
import { classes, feeByClass, formatMoney } from "../utils/fees";

const emptyStudent = { username: "", name: "", class: "6", password: "" };

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ search: "", class: "" });
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();

  const loadData = async () => {
    const query = new URLSearchParams(filters).toString();
    const [statsRes, studentsRes, paymentsRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get(`/admin/students?${query}`),
      api.get("/admin/payments")
    ]);
    setStats(statsRes.data);
    setStudents(studentsRes.data);
    setPayments(paymentsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => toast.error("Unable to load admin data"));
  }, []);

  const cards = useMemo(() => [
    ["Total Students", stats.totalStudents || 0],
    ["Paid Students", stats.paidStudents || 0],
    ["Pending Payments", stats.pendingPayments || 0],
    ["Rejected Payments", stats.rejectedPayments || 0],
    ["Total Collection", formatMoney(stats.totalCollection || 0)]
  ], [stats]);

  const downloadCsv = async () => {
    const { data } = await api.get("/admin/export/fees.csv", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "fee-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveStudent = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        const payload = { ...studentForm };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/students/${editingId}`, payload);
        toast.success("Student updated");
      } else {
        await api.post("/admin/students", studentForm);
        toast.success("Student added");
      }
      setStudentForm(emptyStudent);
      setEditingId(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save student");
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setStudentForm({ username: student.username, name: student.name, class: student.class, password: "" });
  };

  const deleteStudent = async (id) => {
    if (!confirm("Delete this student and payment records?")) return;
    await api.delete(`/student/${id}`);
    toast.success("Student deleted");
    loadData();
  };

  const updatePayment = async (paymentId, action) => {
    await api.put(`/admin/${action}`, { paymentId });
    toast.success(action === "approve" ? "Payment accepted" : "Payment rejected");
    loadData();
  };

  const uploadAdminPhoto = async (file) => {
    if (!file) return;
    const payload = new FormData();
    payload.append("profilePhoto", file);
    const { data } = await api.put("/admin/profile", payload, { headers: { "Content-Type": "multipart/form-data" } });
    setUser(data);
    localStorage.setItem("tms_user", JSON.stringify(data));
    toast.success("Admin profile photo updated");
  };

  return (
    <Shell type="admin">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-mint">Admin Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold">Tuition control center</h1>
        </div>
        <button className="btn-outline flex items-center gap-2" onClick={downloadCsv}><Download size={18} /> Export CSV</button>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-5">
        {cards.map(([label, value]) => (
          <div className="card" key={label}><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-2xl font-black">{value}</p></div>
        ))}
      </section>

      <section className="card mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-mint/50 bg-ink text-2xl font-bold text-mint">
            {user?.profilePhoto ? <img className="h-full w-full object-cover" src={fileUrl(user.profilePhoto)} alt="Admin profile" /> : user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-slate-400">Admin Tuition ID</p>
            <p className="text-2xl font-bold text-mint">{user?.tuitionId || "Generated after upload"}</p>
            <p className="mt-1 text-slate-400">@{user?.username}</p>
          </div>
        </div>
        <label className="btn-outline cursor-pointer text-center">
          Upload Profile Photo
          <input className="hidden" type="file" accept="image/*" onChange={(e) => uploadAdminPhoto(e.target.files[0])} />
        </label>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={saveStudent} className="card">
          <h2 className="text-2xl font-bold">{editingId ? "Edit Student" : "Add Student"}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="input" placeholder="Username" value={studentForm.username} onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })} />
            <input className="input" placeholder="Full Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
            <select className="input" value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}>{classes.map((item) => <option key={item}>{item}</option>)}</select>
            <input className="input" placeholder="Password" type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} />
          </div>
          <p className="mt-4 text-mint">Fee: {formatMoney(feeByClass[studentForm.class])}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button className="btn-primary">{editingId ? "Save Changes" : "Add Student"}</button>
            {editingId && <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setStudentForm(emptyStudent); }}>Cancel</button>}
          </div>
        </form>

        <div className="card">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1"><Search className="absolute left-3 top-3.5 text-slate-500" size={18} /><input className="input pl-10" placeholder="Search student" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
            <select className="input md:w-40" value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })}><option value="">All Classes</option>{classes.map((item) => <option key={item}>{item}</option>)}</select>
            <button className="btn-outline" onClick={loadData}>Filter</button>
          </div>
          <div className="mt-5 max-h-[360px] overflow-auto">
            {students.map((student) => (
              <div key={student._id} className="flex flex-col gap-3 border-t border-line py-4 md:flex-row md:items-center md:justify-between">
                <div><p className="font-bold">{student.name}</p><p className="text-sm text-slate-400">{student.tuitionId || "No ID"} | @{student.username} | Class {student.class} | {formatMoney(student.feeAmount)}</p></div>
                <div className="flex items-center gap-3"><StatusBadge status={student.feeStatus} /><button className="btn-outline !px-3" onClick={() => startEdit(student)}><Pencil size={17} /></button><button className="btn-outline !px-3" onClick={() => deleteStudent(student._id)}><Trash2 size={17} /></button></div>
              </div>
            ))}
            {!loading && students.length === 0 && <p className="py-6 text-slate-400">No students found.</p>}
          </div>
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="text-2xl font-bold">Payment Approvals</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="text-sm text-slate-400"><tr><th className="py-3">Student</th><th>Class</th><th>Month</th><th>Amount</th><th>Mode</th><th>Transaction</th><th>Note</th><th>Proof</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-t border-line">
                  <td className="py-4">{payment.studentId?.name}</td><td>{payment.studentId?.class}</td><td>{payment.month}</td><td>{formatMoney(payment.amount)}</td><td>{payment.paymentMode}</td><td>{payment.transactionId}</td><td className="max-w-48 truncate">{payment.paymentNote}</td>
                  <td>{payment.screenshot ? <a className="text-mint" href={fileUrl(payment.screenshot)} target="_blank">View</a> : "None"}</td>
                  <td><StatusBadge status={payment.status} /></td>
                  <td>
                    {payment.status === "Pending" ? (
                      <div className="flex gap-2"><button className="btn-outline !px-3" onClick={() => updatePayment(payment._id, "approve")}><Check size={17} /></button><button className="btn-outline !px-3" onClick={() => updatePayment(payment._id, "reject")}><X size={17} /></button></div>
                    ) : (
                      <span className="text-sm text-slate-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
};

export default AdminDashboard;
