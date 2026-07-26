import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import OTP from "../models/OTP.js";
import { getFeeForClass, isValidClass } from "../utils.js";
import { makeTuitionId } from "../idUtils.js";
import { sendOTPEmail } from "../services/emailService.js";
import { protectStudent, protectAdmin } from "../middleware/auth.js";


const router = express.Router();

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.get("/brand", async (_req, res, next) => {
  try {
    const admin = await Admin.findOne({
      profilePhoto: { $exists: true, $nin: ["", null] }
    })
      .select("profilePhoto")
      .sort({ updatedAt: -1 });

    res.json({
      text: "Aditya Singh \u2022 Kaizen Sensei",
      photo: admin?.profilePhoto || ""
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/signup",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("name").trim().notEmpty().withMessage("Full name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("class").trim().custom(isValidClass).withMessage("Class must be from 4 to 10"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, name, email, phone, password } = req.body;
      const studentClass = req.body.class;
      const exists = await Student.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Username already exists" });

      const student = await Student.create({
        username,
        tuitionId: makeTuitionId("student"),
        name,
        email,
        phone,
        class: studentClass,
        password,
        accountStatus: "Pending Enrollment",
        accountDisabled: false,
        feeAmount: getFeeForClass(studentClass)
      });

      res.status(201).json({
        message: "Account created. Please wait for admin enrollment approval.",
        user: student.toSafeObject()
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const username = req.body.username.toLowerCase();
      const { password, role = "student" } = req.body;

      if (role === "admin") {
        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.matchPassword(password))) {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
        if (!admin.tuitionId) {
          admin.tuitionId = makeTuitionId("admin");
          await admin.save();
        }
        return res.json({
          token: signToken(admin._id, "admin"),
          role: "admin",
          user: admin.toSafeObject()
        });
      }

      const student = await Student.findOne({ username });
      if (!student || !(await student.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid student credentials" });
      }
      if (!student.tuitionId) {
        student.tuitionId = makeTuitionId("student");
        await student.save();
      }
      if (!student.accountStatus) {
        student.accountStatus = "Approved";
        await student.save();
      }
      if (student.accountDisabled) {
        return res.status(403).json({ message: "Your account is disabled. Contact admin." });
      }
      if (student.accountStatus !== "Approved") {
        return res.status(403).json({ message: `Enrollment status: ${student.accountStatus}` });
      }

      res.json({
        token: signToken(student._id, "student"),
        role: "student",
        user: student.toSafeObject()
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/admin/signup",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validate,
  async (req, res, next) => {
    try {
      const username = req.body.username.toLowerCase();
      const exists = await Admin.findOne({ username });
      if (exists) return res.status(409).json({ message: "Admin username already exists" });

      const admin = await Admin.create({ username, password: req.body.password, tuitionId: makeTuitionId("admin") });
      res.status(201).json({
        token: signToken(admin._id, "admin"),
        role: "admin",
        user: admin.toSafeObject()
      });
    } catch (error) {
      next(error);
    }
  }
);

// OTP Verification Endpoints

// 1. Send OTP for new student registration
router.post(
  "/auth/send-registration-otp",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("name").trim().notEmpty().withMessage("Full name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("class").trim().custom(isValidClass).withMessage("Class must be from 4 to 10"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, email } = req.body;

      const usernameExists = await Student.findOne({ username: username.toLowerCase() });
      if (usernameExists) return res.status(409).json({ message: "Username already exists" });

      const emailExists = await Student.findOne({ email: email.toLowerCase() });
      if (emailExists) return res.status(409).json({ message: "Email already exists" });

      const existingOTP = await OTP.findOne({ email: email.toLowerCase(), purpose: "registration" });
      if (existingOTP) {
        const secondsElapsed = (Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000;
        if (secondsElapsed < 60) {
          return res.status(429).json({
            message: `Please wait ${Math.ceil(60 - secondsElapsed)} seconds before requesting a new OTP.`
          });
        }
        await OTP.deleteOne({ _id: existingOTP._id });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const salt = await bcrypt.genSalt(12);
      const hashedOTP = await bcrypt.hash(otp, salt);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await OTP.create({
        email: email.toLowerCase(),
        hashedOTP,
        expiresAt,
        purpose: "registration",
        createdAt: new Date()
      });

      await sendOTPEmail(email, otp, "registration");

      res.status(200).json({ message: "OTP sent to your email successfully." });
    } catch (error) {
      next(error);
    }
  }
);

// 2. Resend OTP for new student registration
router.post(
  "/auth/resend-registration-otp",
  [
    body("email").trim().isEmail().withMessage("Valid email is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const emailExists = await Student.findOne({ email: email.toLowerCase() });
      if (emailExists) return res.status(409).json({ message: "Email already exists" });

      const existingOTP = await OTP.findOne({ email: email.toLowerCase(), purpose: "registration" });
      if (existingOTP) {
        const secondsElapsed = (Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000;
        if (secondsElapsed < 60) {
          return res.status(429).json({
            message: `Please wait ${Math.ceil(60 - secondsElapsed)} seconds before resending OTP.`
          });
        }
        await OTP.deleteOne({ _id: existingOTP._id });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 12);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await OTP.create({
        email: email.toLowerCase(),
        hashedOTP,
        expiresAt,
        purpose: "registration",
        createdAt: new Date()
      });

      await sendOTPEmail(email, otp, "registration");

      res.status(200).json({ message: "OTP resent to your email successfully." });
    } catch (error) {
      next(error);
    }
  }
);

// 3. Verify OTP & complete student registration
router.post(
  "/auth/verify-registration-otp",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("name").trim().notEmpty().withMessage("Full name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("class").trim().custom(isValidClass).withMessage("Class must be from 4 to 10"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, name, email, phone, password, otp } = req.body;
      const studentClass = req.body.class;

      const otpRecord = await OTP.findOne({ email: email.toLowerCase(), purpose: "registration" });
      if (!otpRecord) {
        return res.status(400).json({ message: "OTP expired or invalid. Please request a new OTP." });
      }

      if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
      }

      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
      }

      otpRecord.attempts += 1;
      await otpRecord.save();

      const isMatch = await bcrypt.compare(otp, otpRecord.hashedOTP);
      if (!isMatch) {
        const attemptsLeft = 5 - otpRecord.attempts;
        return res.status(400).json({
          message: `Invalid OTP. ${attemptsLeft} attempts remaining.`
        });
      }

      await OTP.deleteOne({ _id: otpRecord._id });

      const exists = await Student.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Username already exists" });

      const emailExists = await Student.findOne({ email: email.toLowerCase() });
      if (emailExists) return res.status(409).json({ message: "Email already exists" });

      const student = await Student.create({
        username,
        tuitionId: makeTuitionId("student"),
        name,
        email,
        phone,
        class: studentClass,
        password,
        accountStatus: "Pending Enrollment",
        accountDisabled: false,
        feeAmount: getFeeForClass(studentClass),
        emailVerified: true,
        emailVerifiedAt: new Date()
      });

      res.status(201).json({
        message: "Account created. Please wait for admin enrollment approval.",
        user: student.toSafeObject()
      });
    } catch (error) {
      next(error);
    }
  }
);

// 4. Send email verification OTP for existing logged-in admin
router.post(
  "/auth/send-email-verification",
  protectAdmin,
  [
    body("email").trim().isEmail().withMessage("Valid email is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const adminId = req.user._id;

      const emailExists = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: adminId } });
      if (emailExists) return res.status(409).json({ message: "Email already registered by another admin account" });

      const existingOTP = await OTP.findOne({ email: email.toLowerCase(), purpose: "email-verification" });
      if (existingOTP) {
        const secondsElapsed = (Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000;
        if (secondsElapsed < 60) {
          return res.status(429).json({
            message: `Please wait ${Math.ceil(60 - secondsElapsed)} seconds before requesting a new OTP.`
          });
        }
        await OTP.deleteOne({ _id: existingOTP._id });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 12);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await OTP.create({
        email: email.toLowerCase(),
        hashedOTP,
        expiresAt,
        purpose: "email-verification",
        createdAt: new Date()
      });

      await sendOTPEmail(email, otp, "email-verification");

      res.status(200).json({ message: "Verification OTP sent to your email." });
    } catch (error) {
      next(error);
    }
  }
);

// 5. Resend email verification OTP for existing logged-in admin
router.post(
  "/auth/resend-email-verification",
  protectAdmin,
  [
    body("email").trim().isEmail().withMessage("Valid email is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const adminId = req.user._id;

      const emailExists = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: adminId } });
      if (emailExists) return res.status(409).json({ message: "Email already registered by another admin account" });

      const existingOTP = await OTP.findOne({ email: email.toLowerCase(), purpose: "email-verification" });
      if (existingOTP) {
        const secondsElapsed = (Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000;
        if (secondsElapsed < 60) {
          return res.status(429).json({
            message: `Please wait ${Math.ceil(60 - secondsElapsed)} seconds before resending OTP.`
          });
        }
        await OTP.deleteOne({ _id: existingOTP._id });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 12);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await OTP.create({
        email: email.toLowerCase(),
        hashedOTP,
        expiresAt,
        purpose: "email-verification",
        createdAt: new Date()
      });

      await sendOTPEmail(email, otp, "email-verification");

      res.status(200).json({ message: "Verification OTP resent to your email." });
    } catch (error) {
      next(error);
    }
  }
);

// 6. Verify email OTP & save email details for existing admin
router.post(
  "/auth/verify-email",
  protectAdmin,
  [
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const adminId = req.user._id;

      const otpRecord = await OTP.findOne({ email: email.toLowerCase(), purpose: "email-verification" });
      if (!otpRecord) {
        return res.status(400).json({ message: "OTP expired or invalid. Please request a new OTP." });
      }

      if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
      }

      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
      }

      otpRecord.attempts += 1;
      await otpRecord.save();

      const isMatch = await bcrypt.compare(otp, otpRecord.hashedOTP);
      if (!isMatch) {
        const attemptsLeft = 5 - otpRecord.attempts;
        return res.status(400).json({
          message: `Invalid OTP. ${attemptsLeft} attempts remaining.`
        });
      }

      await OTP.deleteOne({ _id: otpRecord._id });

      const emailExists = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: adminId } });
      if (emailExists) return res.status(409).json({ message: "Email already registered by another admin account" });

      const admin = await Admin.findById(adminId);
      admin.email = email.toLowerCase();
      admin.emailVerified = true;
      admin.emailVerifiedAt = new Date();
      await admin.save();

      res.json(admin.toSafeObject());
    } catch (error) {
      next(error);
    }
  }
);

export default router;


