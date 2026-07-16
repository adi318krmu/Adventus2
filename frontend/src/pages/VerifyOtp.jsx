import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Brand from "../components/Brand";
import api from "../utils/api";
import { Mail, Clock, ArrowLeft, ShieldAlert } from "lucide-react";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const registrationForm = location.state?.registrationForm;
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const timerRef = useRef(null);

  // If there's no registration state, redirect back to signup page
  useEffect(() => {
    if (!registrationForm) {
      toast.error("Please complete the registration form first");
      navigate("/signup");
    }
  }, [registrationForm, navigate]);

  // Start timer for resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      return toast.error("Please enter a valid 6-digit verification code");
    }
    setLoading(true);
    try {
      const payload = { ...registrationForm, otp };
      const { data } = await api.post("/auth/verify-registration-otp", payload);
      toast.success(data.message || "Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendLoading(true);
    try {
      const { data } = await api.post("/auth/resend-registration-otp", { email: registrationForm.email });
      toast.success(data.message || "A new code has been sent");
      setCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  if (!registrationForm) return null;

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="card w-full max-w-lg">
        <Brand />
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-mint/10 border border-mint/30 text-mint mb-5">
            <Mail size={30} />
          </div>
          <h1 className="text-3xl font-bold">Email Verification</h1>
          <p className="text-slate-400 mt-2 max-w-md">
            We have sent a 6-digit verification code to <span className="font-semibold text-mint">{registrationForm.email}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Enter 6-Digit OTP
              </label>
              <div className="relative">
                <input
                  className="input text-center text-2xl tracking-[0.75rem] font-bold font-mono placeholder:text-slate-700"
                  placeholder="000000"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                For security reasons, this OTP will expire in 5 minutes.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
          >
            {loading ? "Verifying..." : "Verify & Complete Registration"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <Link
            to="/signup"
            className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Edit Account Details
          </Link>
          
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resendLoading}
            className="text-sm font-semibold text-mint hover:underline disabled:text-slate-600 disabled:no-underline flex items-center gap-1"
          >
            {cooldown > 0 ? (
              <>
                <Clock size={16} className="text-slate-500" /> Resend in {cooldown}s
              </>
            ) : resendLoading ? (
              "Sending..."
            ) : (
              "Resend OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
