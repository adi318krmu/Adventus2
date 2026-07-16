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

  // Email Verification Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyStep, setVerifyStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

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
      toast.success("Email verified successfully!");
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
      {(!user?.emailVerified) && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Email Verification Required</h3>
            <p className="text-sm text-slate-400 mt-1">
              Please verify your email address to secure your account and receive tuition center updates.
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
          
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl border border-line p-5">
              <UserRound className="text-mint" />
              <p className="mt-2 text-sm text-slate-400">Student Name</p>
              <p className="text-lg font-bold truncate">{user?.name}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <BookOpen className="text-mint" />
              <p className="mt-2 text-sm text-slate-400">Class</p>
              <p className="text-lg font-bold">Class {user?.class}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <History className="text-mint" />
              <p className="mt-2 text-sm text-slate-400">Fee Status</p>
              <div className="mt-1"><StatusBadge status={user?.feeStatus} /></div>
            </div>
            <div className="rounded-xl border border-line p-5">
              <CreditCard className="text-mint" />
              <p className="mt-2 text-sm text-slate-400">Pending Fees</p>
              <p className="text-lg font-bold">{formatMoney(user?.feeStatus === "Paid" ? 0 : user?.feeAmount)}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <CreditCard className="text-mint" />
              <p className="mt-2 text-sm text-slate-400">Last Payment</p>
              <p className="text-lg font-bold truncate">{lastPayment}</p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <BookOpen className="text-mint" />
              <p className="mt-2 text-sm text-slate-400">Study Materials</p>
              <p className="text-lg font-bold">{numMaterials}</p>
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

export default StudentDashboard;
