import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ["UPI", "Cash"], default: "UPI" },
    transactionId: { type: String, trim: true },
    paymentNote: { type: String, trim: true, maxlength: 500 },
    screenshot: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    month: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
