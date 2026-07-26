import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Check, Download, Pencil, Search, Trash2, X, Mail, ShieldAlert } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { fileUrl } from "../utils/api";
import { classes, feeByClass, formatMoney } from "../utils/fees";

const emptyStudent = { username: "", name: "", email: "", phone: "", class: "4", password: "" };

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ search: "", class: "" });
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
  const [emailLoading, setEmailLoading] = useState(false);

  // Email Verification Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyStep, setVerifyStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    setAdminEmail(user?.email || "");
  }, [user]);

  // Timer for OTP resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [cooldown]);

  const saveAdminEmail = async (e) => {
    e.preventDefault();
    if (!adminEmail) return toast.error("Please enter a valid email address");
    setEmailLoading(true);
    try {
      const { data } = await api.put("/admin/profile", { email: adminEmail });
      setUser(data);
      sessionStorage.setItem("tms_user", JSON.stringify(data));
      toast.success("Admin email updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter a valid email address");
    setVerifyLoading(true);
    try {
      const { data } = await api.post("/auth/send-email-verification", { email });
      toast.success(data.message || "Verification code sent successfully");
      setVerifyStep(2);
      setCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send code");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setVerifyLoading(true);
    try {
      const { data } = await api.post("/auth/resend-email-verification", { email });
      toast.success(data.message || "OTP resent successfully");
      setCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      return toast.error("Please enter a valid 6-digit OTP code");
    }
    setVerifyLoading(true);
    try {
      const { data } = await api.post("/auth/verify-email", { email, otp });
      setUser(data);
      sessionStorage.setItem("tms_user", JSON.stringify(data));
      toast.success("Admin email verified successfully!");
      setShowVerifyModal(false);
      setVerifyStep(1);
      setEmail("");
      setOtp("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const loadData = async () => {
    const query = new URLSearchParams(filters).toString();
    const [statsRes, enrollmentsRes, studentsRes, paymentsRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/enrollments"),
      api.get(`/admin/students?${query}`),
      api.get("/admin/payments")
    ]);
    setStats(statsRes.data);
    setEnrollments(enrollmentsRes.data);
    setStudents(studentsRes.data);
    setPayments(paymentsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => toast.error("Unable to load admin data"));
  }, []);

  const cards = useMemo(() => [
    ["Total Students", stats.totalStudents || 0],
    ["Total Study Materials", stats.totalMaterials || 0],
    ["Pending Password Requests", stats.pendingPasswordRequests || 0],
    ["Pending Fee Requests", stats.pendingFeeRequests || 0],
    ["Today's Admissions", stats.todayAdmissions || 0]
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
    setStudentForm({
      username: student.username,
      name: student.name,
      email: student.email || "",
      phone: student.phone || "",
      class: student.class,
      password: ""
    });
  };

  const updateEnrollment = async (id, action) => {
    await api.put(`/admin/${action}-student/${id}`);
    toast.success(action === "approve" ? "Student approved" : "Student rejected");
    loadData();
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

  const pendingCashPayments = payments.filter((payment) => payment.status === "Pending" && payment.paymentMode === "Cash");

  const uploadAdminPhoto = async (file) => {
    if (!file) return;
    const payload = new FormData();
    payload.append("profilePhoto", file);
    const { data } = await api.put("/admin/profile", payload, { headers: { "Content-Type": "multipart/form-data" } });
    setUser(data);
    sessionStorage.setItem("tms_user", JSON.stringify(data));
    toast.success("Admin profile photo updated");
  };

  return (
    <Shell type="admin">
      {!user?.emailVerified && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Admin Email Verification Required</h3>
            <p className="text-sm text-slate-400 mt-1">
              Please verify your email address to secure your administrator account.
            </p>
          </div>
          <button
            onClick={() => {
              setEmail(user?.email || "");
              setShowVerifyModal(true);
            }}
            className="btn-primary !bg-amber-500 hover:!bg-amber-400 !text-slate-950 !py-2.5 !px-5 whitespace-nowrap self-start md:self-auto font-bold"
          >
            Verify Now
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-mint">Admin Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold">Tuition control center</h1>
        </div>
        <button className="btn-outline flex items-center gap-2" onClick={downloadCsv}><Download size={18} /> Export CSV</button>
      </div>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(([label, value]) => (
          <div className="card flex flex-col justify-between h-full min-h-[110px]" key={label}>
            <p className="text-sm text-slate-400 leading-snug">{label}</p>
            <p className="mt-4 text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </section>


      <section className="card mt-6 grid gap-6 md:grid-cols-2 items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-mint/50 bg-ink text-2xl font-bold text-mint flex-shrink-0">
            {user?.profilePhoto ? <img className="h-full w-full object-cover" src={fileUrl(user.profilePhoto)} alt="Admin profile" /> : user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-slate-400">Admin Tuition ID</p>
            <p className="text-2xl font-bold text-mint">{user?.tuitionId || "Generated after upload"}</p>
            <p className="mt-1 text-slate-400">@{user?.username} {user?.emailVerified && <span className="ml-2 text-xs bg-mint/20 text-mint px-2 py-0.5 rounded-full font-bold">Verified</span>}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
          <form onSubmit={saveAdminEmail} className="flex gap-2 w-full max-w-md">
            <input
              type="email"
              className="input !py-2.5"
              placeholder="Admin Email Address"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <button disabled={emailLoading} className="btn-primary !py-2.5 whitespace-nowrap">
              {emailLoading ? "Saving..." : "Save Email"}
            </button>
          </form>
          <label className="btn-outline cursor-pointer text-center !py-2.5 whitespace-nowrap flex-shrink-0">
            Upload Photo
            <input className="hidden" type="file" accept="image/*" onChange={(e) => uploadAdminPhoto(e.target.files[0])} />
          </label>
        </div>
      </section>

      <section className="card mt-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-mint">Enrollment Approval</p>
            <h2 className="mt-1 text-2xl font-bold">New Student Enrollments</h2>
          </div>
          <StatusBadge status={`${enrollments.length} Pending`} />
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="text-sm text-slate-400">
              <tr><th className="py-3">Student Name</th><th>Username</th><th>Class</th><th>Tuition ID</th><th>Signup Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {enrollments.map((student) => (
                <tr key={student._id} className="border-t border-line">
                  <td className="py-4 font-semibold">{student.name}</td>
                  <td>@{student.username}</td>
                  <td>Class {student.class}</td>
                  <td>{student.tuitionId}</td>
                  <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-outline !px-3" onClick={() => updateEnrollment(student._id, "approve")}><Check size={17} /></button>
                      <button className="btn-outline !px-3" onClick={() => updateEnrollment(student._id, "reject")}><X size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && <tr><td className="py-5 text-slate-400">No new enrollment requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={saveStudent} className="card">
          <h2 className="text-2xl font-bold">{editingId ? "Edit Student" : "Add Student"}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="input" placeholder="Username" value={studentForm.username} onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })} />
            <input className="input" placeholder="Full Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
            <input className="input" placeholder="Email Address" type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
            <input className="input" placeholder="Phone Number" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} />
            <select className="input" value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}>{classes.map((item) => <option key={item}>{item}</option>)}</select>
            {!editingId && <input className="input" placeholder="Password" type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} />}
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
                <div><p className="font-bold">{student.name}</p><p className="text-sm text-slate-400">{student.tuitionId || "No ID"} | @{student.username} | {student.email || "No Email"} | {student.phone || "No Phone"} | Class {student.class} | {formatMoney(student.feeAmount)}</p></div>
                <div className="flex items-center gap-3"><StatusBadge status={student.feeStatus} /><button className="btn-outline !px-3" onClick={() => startEdit(student)}><Pencil size={17} /></button><button className="btn-outline !px-3" onClick={() => deleteStudent(student._id)}><Trash2 size={17} /></button></div>
              </div>
            ))}
            {!loading && students.length === 0 && <p className="py-6 text-slate-400">No students found.</p>}
          </div>
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="text-2xl font-bold">Cash Payment Approvals</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="text-sm text-slate-400"><tr><th className="py-3">Student Name</th><th>Payment Mode</th><th>Amount</th><th>Month</th><th>Payment Notes</th><th>Action</th></tr></thead>
            <tbody>
              {pendingCashPayments.map((payment) => (
                <tr key={payment._id} className="border-t border-line">
                  <td className="py-4">{payment.studentId?.name}</td><td>{payment.paymentMode}</td><td>{formatMoney(payment.amount)}</td><td>{payment.month}</td><td className="max-w-72 truncate">{payment.paymentNote || "No note"}</td>
                  <td>
                    <div className="flex gap-2"><button className="btn-outline !px-3" onClick={() => updatePayment(payment._id, "approve")}><Check size={17} /></button><button className="btn-outline !px-3" onClick={() => updatePayment(payment._id, "reject")}><X size={17} /></button></div>
                  </td>
                </tr>
              ))}
              {pendingCashPayments.length === 0 && <tr><td className="py-5 text-slate-400">No pending cash payments.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-5">
          <div className="card w-full max-w-md relative">
            <button
              onClick={() => {
                setShowVerifyModal(false);
                setVerifyStep(1);
                setOtp("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {verifyStep === 1 ? (
              <form onSubmit={handleSendOTP}>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Mail className="text-mint" /> Email Verification
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Please enter your email address. We will send a 6-digit verification code to this address.
                </p>

                <div className="mt-5 space-y-4">
                  <input
                    type="email"
                    className="input"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={verifyLoading}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={verifyLoading} className="btn-primary flex-1">
                    {verifyLoading ? "Sending..." : "Send Verification OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(false)}
                    className="btn-outline flex-1"
                    disabled={verifyLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="text-mint" /> Enter Verification Code
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  A verification code has been sent to <strong className="text-white">{email}</strong>.
                </p>

                <div className="mt-5 space-y-4">
                  <input
                    className="input text-center text-xl tracking-[0.5rem] font-bold font-mono placeholder:text-slate-700"
                    placeholder="000000"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    disabled={verifyLoading}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={verifyLoading || otp.length !== 6} className="btn-primary flex-1">
                    {verifyLoading ? "Verifying..." : "Verify Code"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={cooldown > 0 || verifyLoading}
                    className="btn-outline flex-1 flex items-center justify-center gap-2"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setVerifyStep(1)}
                  className="mt-4 text-xs font-semibold text-mint hover:underline block mx-auto"
                  disabled={verifyLoading}
                >
                  Change Email Address
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
};

export default AdminDashboard;
