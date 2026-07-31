import { useState } from "react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import JapaneseDivider from "../components/JapaneseDivider";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { currentMonth, formatMoney } from "../utils/fees";
import { CreditCard, QrCode, ShieldCheck, CheckCircle2 } from "lucide-react";

const upiId = import.meta.env.VITE_UPI_ID || "9355659492@ybl";
const qrImageUrl = import.meta.env.VITE_QR_IMAGE_URL || "/sbi-upi-qr.jpeg";

const PaymentPage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    paymentMode: "UPI",
    transactionId: "",
    paymentNote: "",
    month: currentMonth(),
    screenshot: null
  });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("paymentMode", form.paymentMode);
      payload.append("month", form.month);
      if (form.paymentNote) payload.append("paymentNote", form.paymentNote);
      if (form.paymentMode === "UPI") {
        payload.append("transactionId", form.transactionId);
        if (form.screenshot) payload.append("screenshot", form.screenshot);
      }
      await api.post("/payment", payload, { headers: { "Content-Type": "multipart/form-data" } });
      const profile = await api.get("/student/profile");
      setUser(profile.data);
      sessionStorage.setItem("tms_user", JSON.stringify(profile.data));
      toast.success(form.paymentMode === "UPI" ? "UPI Payment ledger updated as paid!" : "Cash payment submitted for Grandmaster approval");
      setForm({ paymentMode: "UPI", transactionId: "", paymentNote: "", month: currentMonth(), screenshot: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Treasury QR Scroll Section */}
        <section className="card border-amber-500/40 text-center p-8 shadow-samuraiGold flex flex-col justify-between">
          <div>
            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
              <QrCode size={14} /> Academy Treasury Portal
            </div>
            <h1 className="text-2xl font-black font-display text-white">Monthly Fee Payment</h1>
            <p className="mt-2 text-xs leading-5 text-stone-300">
              {form.paymentMode === "UPI"
                ? "Scan the official QR scroll using any digital UPI wallet."
                : "Cash payments require Grandmaster verification upon receipt."}
            </p>

            {form.paymentMode === "UPI" && (
              <>
                <div className="mx-auto mt-6 inline-block overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-white p-2.5 shadow-samuraiGold">
                  <img className="h-64 w-64 object-cover rounded-xl" src={qrImageUrl} alt="SBI UPI payment QR code" />
                </div>
                <div className="mt-5 rounded-xl border border-amber-500/30 bg-stone-950 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Official Academy UPI ID</p>
                  <p className="mt-1 text-xl font-bold font-mono text-amber-400">{upiId}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-amber-500/30 pt-5">
            <p className="text-3xl font-black font-display text-amber-400">{formatMoney(user?.feeAmount)}</p>
            <p className="mt-1 text-xs text-stone-400 font-display uppercase tracking-wider">Class {user?.class} Monthly Dues for {form.month}</p>
          </div>
        </section>

        {/* Payment Submission Scroll Form */}
        <form onSubmit={submit} className="card border-amber-500/40 p-8 shadow-samuraiGold">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-white">Submit Payment Receipt</h2>
              <p className="text-xs text-stone-300">Enter transaction reference details for Hanko certification.</p>
            </div>
          </div>

          <JapaneseDivider className="my-6" />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Payment Method</label>
              <select className="input" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                <option value="UPI" className="bg-stone-900">UPI Digital Transfer</option>
                <option value="Cash" className="bg-stone-900">Cash Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Billing Month</label>
              <input className="input" type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
            </div>

            {form.paymentMode === "UPI" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">UPI Transaction ID / Ref No.</label>
                <input className="input" required placeholder="e.g. 420918274012" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Payment Note / Notes (Optional)</label>
              <textarea className="input min-h-28 text-xs" placeholder="Add any reference notes or comments for the admin..." value={form.paymentNote} onChange={(e) => setForm({ ...form, paymentNote: e.target.value })} />
            </div>

            {form.paymentMode === "UPI" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Payment Proof Screenshot / PDF (Optional)</label>
                <input className="input text-xs" type="file" accept="image/*,.pdf" onChange={(e) => setForm({ ...form, screenshot: e.target.files[0] })} />
              </div>
            )}
          </div>

          <button disabled={loading} className="btn-primary mt-6 w-full font-display uppercase tracking-wider text-xs py-3.5 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            {loading ? "Submitting Ledger..." : form.paymentMode === "UPI" ? "Certify UPI Payment" : "Submit Cash Payment for Approval"}
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default PaymentPage;
