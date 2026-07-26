import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { makeTuitionId } from "../idUtils.js";

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    tuitionId: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    profilePhoto: { type: String, default: "" },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date }
  },
  { timestamps: true }
);

adminSchema.pre("validate", function addTuitionId(next) {
  if (!this.tuitionId) this.tuitionId = makeTuitionId("admin");
  next();
});

adminSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

adminSchema.methods.toSafeObject = function toSafeObject() {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

export default mongoose.model("Admin", adminSchema);
