import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { makeTuitionId } from "../idUtils.js";

const paymentHistorySnapshotSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    amount: Number,
    month: String,
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    transactionId: String,
    paidAt: Date
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    tuitionId: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    class: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    isTempPassword: { type: Boolean, default: false },
    profilePhoto: { type: String, default: "" },
    accountStatus: {
      type: String,
      enum: ["Pending Enrollment", "Approved", "Rejected"],
      default: "Pending Enrollment"
    },
    accountDisabled: { type: Boolean, default: false },
    feeAmount: { type: Number, required: true },
    feeStatus: {
      type: String,
      enum: ["Paid", "Pending", "Rejected"],
      default: "Pending"
    },
    paymentHistory: [paymentHistorySnapshotSchema]
  },
  { timestamps: true }
);

studentSchema.pre("validate", function addTuitionId(next) {
  if (!this.tuitionId) this.tuitionId = makeTuitionId("student");
  next();
});

studentSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

studentSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

studentSchema.methods.toSafeObject = function toSafeObject() {
  const student = this.toObject();
  delete student.password;
  return student;
};

export default mongoose.model("Student", studentSchema);
