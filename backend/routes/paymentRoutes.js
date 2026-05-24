import express from "express";
import { body, validationResult } from "express-validator";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import { protectStudent } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { currentMonth } from "../utils.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post(
  "/",
  protectStudent,
  upload.single("screenshot"),
  [
    body("paymentMode").isIn(["UPI", "Cash"]).withMessage("Payment mode must be UPI or Cash"),
    body("transactionId")
      .if(body("paymentMode").equals("UPI"))
      .trim()
      .notEmpty()
      .withMessage("Transaction ID is required for UPI payment"),
    body("month").optional().trim().matches(/^\d{4}-\d{2}$/).withMessage("Month must be YYYY-MM")
  ],
  validate,
  async (req, res, next) => {
    try {
      const student = await Student.findById(req.user._id);
      const month = req.body.month || currentMonth();
      const duplicate = await Payment.findOne({
        studentId: student._id,
        month,
        status: { $in: ["Pending", "Accepted"] }
      });
      if (duplicate) {
        return res.status(409).json({ message: `Payment for ${month} is already ${duplicate.status.toLowerCase()}` });
      }

      if (req.body.paymentMode === "UPI" && !req.body.transactionId) {
        return res.status(400).json({ message: "Transaction ID is required for UPI payment" });
      }

      const status = req.body.paymentMode === "Cash" ? "Pending" : "Accepted";
      const payment = await Payment.create({
        studentId: student._id,
        amount: student.feeAmount,
        paymentMode: req.body.paymentMode || "UPI",
        transactionId: req.body.transactionId,
        paymentNote: req.body.paymentNote || "",
        screenshot: req.file ? `/uploads/${req.file.filename}` : "",
        status,
        month
      });

      student.feeStatus = status === "Accepted" ? "Paid" : "Pending";
      student.paymentHistory.unshift({
        paymentId: payment._id,
        amount: payment.amount,
        month: payment.month,
        status: payment.status,
        transactionId: payment.transactionId,
        paidAt: status === "Accepted" ? new Date() : undefined
      });
      await student.save();

      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/history", protectStudent, async (req, res, next) => {
  try {
    const payments = await Payment.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

export default router;
