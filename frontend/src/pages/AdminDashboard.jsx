import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Check, Download, Pencil, Search, Trash2, X, Mail, ShieldAlert, Crop, Shield, Award, Users } from "lucide-react";
import Shell from "../components/Shell";
import StatusBadge from "../components/StatusBadge";
import ImageCropperModal from "../components/ImageCropperModal";
import UserAvatar from "../components/UserAvatar";
import JapaneseDivider from "../components/JapaneseDivider";
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
  const [verifyStep, setVerifyStep] = useState(1);

  // Profile Photo Cropper States
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    setAdminEmail(user?.email || "");
  }, [user]);

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
    ["Study Materials", stats.totalMaterials || 0],
    ["Password Requests", stats.pendingPasswordRequests || 0],
    ["Fee Requests", stats.pendingFeeRequests || 0],
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
        toast.success("Student record updated");
      } else {
        await api.post("/admin/students", studentForm);
        toast.success("Student added to Dojo");
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
    toast.success(action === "approve" ? "Student enrolled in Dojo" : "Enrollment rejected");
    loadData();
  };

  const deleteStudent = async (id) => {
    if (!confirm("Delete this student and all payment records?")) return;
    await api.delete(`/student/${id}`);
    toast.success("Student removed");
    loadData();
  };

  const updatePayment = async (paymentId, action) => {
    await api.put(`/admin/${action}`, { paymentId });
    toast.success(action === "approve" ? "Payment approved with Hanko seal" : "Payment rejected");
    loadData();
  };

  const pendingCashPayments = payments.filter((payment) => payment.status === "Pending" && payment.paymentMode === "Cash");

  const handleAdminFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const uploadAdminPhoto = async (file) => {
    if (!file) return;
    try {
      const payload = new FormData();
      payload.append("profilePhoto", file);
      const { data } = await api.put("/admin/profile", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(data);
      sessionStorage.setItem("tms_user", JSON.stringify(data));
      toast.success("Admin profile photo updated");
    } catch {
      toast.error("Failed to update profile photo");
    }
  };

  return (
    <Shell type="admin">
      {!user?.emailVerified && (
        <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-samuraiGold">
          <div className="flex items-center gap-3">
            <ShieldAlert size={26} className="text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold font-display text-lg text-amber-300">Grandmaster Email Verification Required</h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Verify your administrator email address to enforce secure access across the Academy.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEmail(user?.email || "");
              setShowVerifyModal(true);
            }}
            className="btn-primary !py-2.5 !px-5 font-display text-xs uppercase tracking-wider whitespace-nowrap self-start md:self-auto"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-amber-500/30 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
            <Award size={14} /> Grandmaster Command Center
          </p>
          <h1 className="mt-1 text-3xl font-black font-display text-white">Academy Administration Dojo</h1>
        </div>
        <button className="btn-outline flex items-center gap-2 text-xs font-display uppercase tracking-wider !py-2.5 !px-4" onClick={downloadCsv}>
          <Download size={16} /> Export Treasury CSV
        </button>
      </div>

      {/* KPI Cards */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(([label, value]) => (
          <div className="card border-amber-500/30 flex flex-col justify-between h-full min-h-[110px] hover:border-amber-500/60" key={label}>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display">{label}</p>
            <p className="mt-3 text-3xl font-black font-display text-white">{value}</p>
          </div>
        ))}
      </section>

      {/* Grandmaster Profile Card */}
      <section className="card mt-6 border-amber-500/30 grid gap-6 md:grid-cols-2 items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-stone-950 text-xl font-bold text-amber-400 flex-shrink-0 shadow-samuraiGold">
            {user?.profilePhoto ? <img className="h-full w-full object-cover" src={fileUrl(user.profilePhoto)} alt="Admin profile" /> : user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Grandmaster ID</p>
            <p className="text-xl font-black font-display text-amber-400">{user?.tuitionId || "Generated on Save"}</p>
            <p className="mt-0.5 text-xs text-stone-300 font-mono">@{user?.username} {user?.emailVerified && <span className="ml-2 text-[10px] font-display uppercase bg-emerald-950/60 border border-emerald-600/60 text-emerald-400 px-2 py-0.5 rounded-md font-bold">Verified</span>}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
          <form onSubmit={saveAdminEmail} className="flex gap-2 w-full max-w-md">
            <input
              type="email"
              className="input !py-2 text-xs"
              placeholder="Admin Email Address"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <button disabled={emailLoading} className="btn-primary !py-2 text-xs font-display uppercase tracking-wider whitespace-nowrap">
              {emailLoading ? "Saving..." : "Save Email"}
            </button>
          </form>
          <label className="btn-outline cursor-pointer text-center !py-2 text-xs font-display uppercase tracking-wider whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-1.5">
            <Crop size={15} />
            <span>Crop Photo</span>
            <input className="hidden" type="file" accept="image/*" onChange={handleAdminFileSelect} />
          </label>
        </div>
      </section>

      {/* New Enrollments Pending Approval */}
      <section className="card mt-6 border-amber-500/30">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-amber-500/30 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">Enrollment Queue</p>
            <h2 className="mt-1 text-xl font-black font-display text-white">Apprentice Applications</h2>
          </div>
          <StatusBadge status={`${enrollments.length} Pending`} />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="font-display uppercase tracking-wider text-amber-400/90 border-b border-amber-500/30">
              <tr><th className="py-3 px-4">Student Name</th><th className="px-4">Username</th><th className="px-4">Class</th><th className="px-4">Tuition ID</th><th className="px-4">Application Date</th><th className="px-4">Decision</th></tr>
            </thead>
            <tbody>
              {enrollments.map((student) => (
                <tr key={student._id} className="border-t border-amber-500/10 hover:bg-amber-500/5 transition">
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={student} className="h-8 w-8 text-xs" />
                      <span>{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 font-mono text-stone-300">@{student.username}</td>
                  <td className="px-4 font-bold font-display text-amber-400">Class {student.class}</td>
                  <td className="px-4 font-mono text-stone-400">{student.tuitionId}</td>
                  <td className="px-4 text-stone-300">{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td className="px-4">
                    <div className="flex gap-2">
                      <button className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1" onClick={() => updateEnrollment(student._id, "approve")} title="Approve Student"><Check size={15} /> Approve</button>
                      <button className="rounded-xl border border-red-700/60 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60" onClick={() => updateEnrollment(student._id, "reject")} title="Reject Application"><X size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-stone-400">No new enrollment applications in queue.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Student Directory Management */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={saveStudent} className="card border-amber-500/30">
          <h2 className="text-xl font-black font-display text-white">{editingId ? "Edit Apprentice Record" : "Add New Student"}</h2>
          <JapaneseDivider className="my-4" />
          <div className="grid gap-3.5 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 font-display mb-1">Username</label>
              <input className="input !py-2 text-xs" placeholder="Username" value={studentForm.username} onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 font-display mb-1">Full Name</label>
              <input className="input !py-2 text-xs" placeholder="Full Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 font-display mb-1">Email Address</label>
              <input className="input !py-2 text-xs" placeholder="Email Address" type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 font-display mb-1">Phone Number</label>
              <input className="input !py-2 text-xs" placeholder="Phone Number" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 font-display mb-1">Class Rank</label>
              <select className="input !py-2 text-xs" value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}>{classes.map((item) => <option key={item} value={item} className="bg-stone-900">Class {item}</option>)}</select>
            </div>
            {!editingId && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 font-display mb-1">Initial Password</label>
                <input className="input !py-2 text-xs" placeholder="Password" type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} required />
              </div>
            )}
          </div>
          <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold flex justify-between items-center">
            <span>Class Fee Rate:</span>
            <strong className="text-sm font-display text-amber-400">{formatMoney(feeByClass[studentForm.class])}</strong>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button className="btn-primary font-display uppercase tracking-wider text-xs !py-3">{editingId ? "Save Record" : "Add Student"}</button>
            {editingId && <button type="button" className="btn-outline font-display uppercase tracking-wider text-xs !py-3" onClick={() => { setEditingId(null); setStudentForm(emptyStudent); }}>Cancel</button>}
          </div>
        </form>

        <div className="card border-amber-500/30">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
              <Users size={18} className="text-amber-400" /> Student Registry
            </h2>
            <span className="text-xs font-bold text-amber-400 font-display">{students.length} Registered</span>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-3 text-stone-500" size={16} />
              <input className="input pl-9 !py-2 text-xs" placeholder="Search student by name or ID..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </label>
            <select className="input md:w-36 !py-2 text-xs" value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
              <option value="" className="bg-stone-900">All Classes</option>
              {classes.map((item) => <option key={item} value={item} className="bg-stone-900">Class {item}</option>)}
            </select>
            <button className="btn-outline text-xs font-display uppercase tracking-wider !py-2 !px-4" onClick={loadData}>Search</button>
          </div>

          <div className="mt-4 max-h-[380px] overflow-auto space-y-2.5">
            {students.map((student) => (
              <div key={student._id} className="p-3 rounded-xl border border-amber-500/20 bg-stone-900/60 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between hover:border-amber-500/40 transition">
                <div>
                  <p className="font-bold text-white text-xs">{student.name}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    <span className="font-mono text-amber-400">{student.tuitionId || "No ID"}</span> | @{student.username} | Class {student.class} | {formatMoney(student.feeAmount)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={student.feeStatus} />
                  <button className="btn-outline !p-2" onClick={() => startEdit(student)} title="Edit Student"><Pencil size={14} /></button>
                  <button className="rounded-xl border border-red-700/60 bg-red-950/40 p-2 text-red-300 hover:bg-red-900/60" onClick={() => deleteStudent(student._id)} title="Delete Student"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {!loading && students.length === 0 && <p className="py-6 text-center text-stone-400 text-xs">No students found matching filters.</p>}
          </div>
        </div>
      </section>

      {/* Cash Payment Approvals Table */}
      <section className="card mt-6 border-amber-500/30">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">Treasury Ledger</p>
            <h2 className="mt-1 text-xl font-black font-display text-white">Pending Cash Payment Approvals</h2>
          </div>
          <StatusBadge status={`${pendingCashPayments.length} Pending`} />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="font-display uppercase tracking-wider text-amber-400/90 border-b border-amber-500/30">
              <tr><th className="py-3 px-4">Student Name</th><th className="px-4">Method</th><th className="px-4">Amount</th><th className="px-4">Month</th><th className="px-4">Notes</th><th className="px-4">Hanko Approval</th></tr>
            </thead>
            <tbody>
              {pendingCashPayments.map((payment) => (
                <tr key={payment._id} className="border-t border-amber-500/10 hover:bg-amber-500/5 transition">
                  <td className="py-3.5 px-4 font-bold text-white">{payment.studentId?.name}</td>
                  <td className="px-4 text-stone-300">{payment.paymentMode}</td>
                  <td className="px-4 font-bold text-amber-400 font-display">{formatMoney(payment.amount)}</td>
                  <td className="px-4 text-stone-300">{payment.month}</td>
                  <td className="px-4 max-w-72 truncate text-stone-400">{payment.paymentNote || "No note"}</td>
                  <td className="px-4">
                    <div className="flex gap-2">
                      <button className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1" onClick={() => updatePayment(payment._id, "approve")} title="Approve Cash Payment"><Check size={15} /> Approve</button>
                      <button className="rounded-xl border border-red-700/60 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60" onClick={() => updatePayment(payment._id, "reject")} title="Reject Cash Payment"><X size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingCashPayments.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-stone-400">No pending cash payment approvals in treasury.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md grid place-items-center p-5">
          <div className="card w-full max-w-md border-amber-500/50 p-6 shadow-samuraiGold relative">
            <button
              onClick={() => {
                setShowVerifyModal(false);
                setVerifyStep(1);
                setOtp("");
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {verifyStep === 1 ? (
              <form onSubmit={handleSendOTP}>
                <h3 className="text-xl font-black font-display text-white flex items-center gap-2">
                  <Mail className="text-amber-400" /> Admin Email Verification
                </h3>
                <p className="text-xs text-stone-300 mt-2">
                  Enter your email address to receive a 6-digit security code.
                </p>

                <div className="mt-5 space-y-4">
                  <input
                    type="email"
                    className="input text-xs"
                    placeholder="Admin Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={verifyLoading}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={verifyLoading} className="btn-primary flex-1 text-xs font-display uppercase tracking-wider py-2.5">
                    {verifyLoading ? "Sending Code..." : "Send Verification OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(false)}
                    className="btn-outline flex-1 text-xs font-display uppercase tracking-wider py-2.5"
                    disabled={verifyLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <h3 className="text-xl font-black font-display text-white flex items-center gap-2">
                  <ShieldAlert className="text-amber-400" /> Enter Verification Code
                </h3>
                <p className="text-xs text-stone-300 mt-2">
                  A 6-digit code was sent to <strong className="text-amber-400 font-display">{email}</strong>.
                </p>

                <div className="mt-5 space-y-4">
                  <input
                    className="input text-center text-xl tracking-[0.5rem] font-bold font-mono placeholder:text-stone-700"
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
                  <button type="submit" disabled={verifyLoading || otp.length !== 6} className="btn-primary flex-1 text-xs font-display uppercase tracking-wider py-2.5">
                    {verifyLoading ? "Verifying..." : "Verify Code"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={cooldown > 0 || verifyLoading}
                    className="btn-outline flex-1 text-xs font-display uppercase tracking-wider py-2.5 flex items-center justify-center gap-2"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setVerifyStep(1)}
                  className="mt-4 text-xs font-bold font-display uppercase text-amber-400 hover:underline block mx-auto"
                  disabled={verifyLoading}
                >
                  Change Email Address
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showCropper && (
        <ImageCropperModal
          imageSrc={rawImageSrc}
          onCropComplete={async (croppedFile) => {
            setShowCropper(false);
            await uploadAdminPhoto(croppedFile);
          }}
          onClose={() => setShowCropper(false)}
        />
      )}
    </Shell>
  );
};

export default AdminDashboard;
