import { useState } from "react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { currentMonth, formatMoney } from "../utils/fees";

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
      toast.success(form.paymentMode === "UPI" ? "UPI payment saved as paid" : "Cash payment sent for approval");
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
        <section className="card text-center">
          <h1 className="text-3xl font-bold">Pay Monthly Fee</h1>
          <p className="mt-3 text-slate-400">{form.paymentMode === "UPI" ? "Scan and pay through any UPI app." : "Cash payments need admin approval after submission."}</p>
          {form.paymentMode === "UPI" && (
            <>
              <div className="mx-auto mt-8 inline-block overflow-hidden rounded-2xl border border-line bg-white p-2">
                <img className="h-72 w-72 object-cover" src={qrImageUrl} alt="SBI UPI payment QR code" />
              </div>
              <div className="mt-6 rounded-xl border border-line bg-ink p-4">
                <p className="text-sm text-slate-400">UPI ID</p>
                <p className="mt-1 text-2xl font-bold text-mint">{upiId}</p>
              </div>
            </>
          )}
          <p className="mt-5 text-4xl font-black">{formatMoney(user?.feeAmount)}</p>
          <p className="mt-2 text-slate-400">Saving payment for {form.month}</p>
        </section>

        <form onSubmit={submit} className="card">
          <h2 className="text-2xl font-bold">Submit payment confirmation</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <select className="input" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
              <option>UPI</option>
              <option>Cash</option>
            </select>
            <input className="input" type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
            {form.paymentMode === "UPI" && <input className="input md:col-span-2" required placeholder="UPI transaction ID" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />}
            <textarea className="input min-h-32 md:col-span-2" placeholder="Payment note or message" value={form.paymentNote} onChange={(e) => setForm({ ...form, paymentNote: e.target.value })} />
            {form.paymentMode === "UPI" && <input className="input md:col-span-2" type="file" accept="image/*,.pdf" onChange={(e) => setForm({ ...form, screenshot: e.target.files[0] })} />}
          </div>
          <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? "Submitting..." : form.paymentMode === "UPI" ? "Save UPI Payment" : "Submit Cash for Approval"}</button>
        </form>
      </div>
    </Shell>
  );
};

export default PaymentPage;
