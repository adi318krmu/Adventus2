import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import PasswordResetRequest from "../models/PasswordResetRequest.js";
import { protectAdmin, protectStudent } from "../middleware/auth.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

// Student requests a password reset
router.post(
  "/password-request",
  [
    body("email").trim().isEmail().withMessage("Provide a valid registered email"),
    body("name").trim().notEmpty().withMessage("Student name is required"),
    body("phone").trim().notEmpty().withMessage("Registered phone number is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, name, phone } = req.body;

      // Query database for a student matching details
      const student = await Student.findOne({
        name: new RegExp(`^${name.trim()}$`, "i"),
        email: email.toLowerCase().trim(),
        phone: phone.trim()
      });

      if (!student) {
        return res.status(404).json({ message: "No matching student record found with these details." });
      }

      // Check if there is already a pending request
      const existing = await PasswordResetRequest.findOne({
        studentId: student._id,
        status: "Pending"
      });

      if (existing) {
        return res.status(409).json({ message: "You already have a pending password reset request." });
      }

      await PasswordResetRequest.create({
        studentId: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        status: "Pending"
      });

      res.status(201).json({ message: "Your password reset request has been sent to the administrator." });
    } catch (error) {
      next(error);
    }
  }
);

// Admin fetches password requests
router.get("/password-request", protectAdmin, async (req, res, next) => {
  try {
    const requests = await PasswordResetRequest.find().sort({ requestedAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

// Admin approves password reset
router.put(
  "/password-request/:id/approve",
  protectAdmin,
  [
    body("tempPassword").isLength({ min: 6 }).withMessage("Temporary password must be at least 6 characters")
  ],
  validate,
  async (req, res, next) => {
    try {
      const request = await PasswordResetRequest.findById(req.params.id);
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (request.status !== "Pending") return res.status(400).json({ message: "Request is already resolved" });

      const student = await Student.findById(request.studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });

      // Update password and flag temp password
      student.password = req.body.tempPassword;
      student.isTempPassword = true;
      await student.save();

      request.status = "Approved";
      request.resolvedAt = new Date();
      request.resolvedBy = req.user._id;
      await request.save();

      res.json({ message: "Password reset request approved successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// Admin rejects password reset
router.put("/password-request/:id/reject", protectAdmin, async (req, res, next) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "Pending") return res.status(400).json({ message: "Request is already resolved" });

    request.status = "Rejected";
    request.resolvedAt = new Date();
    request.resolvedBy = req.user._id;
    await request.save();

    res.json({ message: "Password reset request rejected" });
  } catch (error) {
    next(error);
  }
});

// Student changes temporary password to normal password
router.post(
  "/change-password",
  protectStudent,
  [
    body("tempPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { tempPassword, newPassword } = req.body;
      const student = await Student.findById(req.user._id);

      const isMatch = await student.matchPassword(tempPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect temporary/current password" });
      }

      student.password = newPassword;
      student.isTempPassword = false;
      await student.save();

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
