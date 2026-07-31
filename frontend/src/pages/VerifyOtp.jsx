import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Brand from "../components/Brand";
import SakuraPetals from "../components/SakuraPetals";
import JapaneseDivider from "../components/JapaneseDivider";
import ThemeToggle from "../components/ThemeToggle";
import api from "../utils/api";
import { Mail, Clock, ArrowLeft } from "lucide-react";

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
    <div className="relative min-h-screen grid place-items-center px-5 py-10 bg-ink shoji-pattern text-white transition-colors duration-300">
      <SakuraPetals />

      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 card w-full max-w-lg border-amber-500/40 p-8 shadow-samuraiGold">
        <Brand />
        <JapaneseDivider className="my-6" />

        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 mb-4 shadow-samuraiGold">
            <Mail size={28} />
          </div>
          <h1 className="text-2xl font-black font-display text-white">Verification Seal Required</h1>
          <p className="text-xs leading-5 text-stone-300 mt-2 max-w-md">
            Enter the 6-digit verification code sent to <strong className="text-amber-400 font-display">{registrationForm.email}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 font-display block mb-1 text-center">
                6-Digit Security Code
              </label>
              <div className="relative">
                <input
                  className="input text-center text-2xl tracking-[0.75rem] font-bold font-mono placeholder:text-stone-700"
                  placeholder="000000"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-2 text-center">
                This verification code will expire in 5 minutes.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary mt-6 w-full font-display uppercase tracking-wider text-xs py-3.5 flex items-center justify-center gap-2"
          >
            {loading ? "Verifying Seal..." : "Verify Code & Complete Enrollment"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-amber-500/30 pt-6 sm:flex-row">
          <Link
            to="/signup"
            className="text-xs font-bold font-display uppercase tracking-wider text-stone-300 hover:text-amber-300 flex items-center gap-1"
          >
            <ArrowLeft size={15} /> Edit Details
          </Link>
          
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resendLoading}
            className="text-xs font-bold font-display uppercase tracking-wider text-amber-400 hover:underline disabled:text-stone-600 disabled:no-underline flex items-center gap-1"
          >
            {cooldown > 0 ? (
              <>
                <Clock size={15} className="text-stone-500" /> Resend in {cooldown}s
              </>
            ) : resendLoading ? (
              "Sending Code..."
            ) : (
              "Resend Code"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
