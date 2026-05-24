import express from "express";
import { body, validationResult } from "express-validator";
import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Admin from "../models/Admin.js";
import { protectAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { getFeeForClass } from "../utils.js";
import { makeTuitionId } from "../idUtils.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.use(protectAdmin);

router.get("/profile", async (req, res) => {
  res.json(req.user);
});

router.put("/profile", upload.single("profilePhoto"), async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (!admin.tuitionId) admin.tuitionId = makeTuitionId("admin");
    if (req.file) admin.profilePhoto = `/uploads/${req.file.filename}`;
    await admin.save();
    res.json(admin.toSafeObject());
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (_req, res, next) => {
  try {
    const [totalStudents, paidStudents, pendingPayments, rejectedPayments, collection] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ feeStatus: "Paid" }),
      Payment.countDocuments({ status: "Pending" }),
      Payment.countDocuments({ status: "Rejected" }),
      Payment.aggregate([{ $match: { status: "Accepted" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
    ]);

    res.json({
      totalStudents,
      paidStudents,
      pendingPayments,
      rejectedPayments,
      totalCollection: collection[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
});

router.get("/students", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.class) query.class = req.query.class;
    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, "i") },
        { username: new RegExp(req.query.search, "i") }
      ];
    }
    const students = await Student.find(query).select("-password").sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/students",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("name").trim().notEmpty().withMessage("Full name is required"),
    body("class").trim().notEmpty().withMessage("Class is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validate,
  async (req, res, next) => {
    try {
      const student = await Student.create({
        username: req.body.username,
        tuitionId: makeTuitionId("student"),
        name: req.body.name,
        class: req.body.class,
        password: req.body.password,
        feeAmount: getFeeForClass(req.body.class)
      });
      res.status(201).json(student.toSafeObject());
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: "Username already exists" });
      next(error);
    }
  }
);

router.put("/students/:id", async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    ["username", "name", "feeStatus"].forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });
    if (req.body.class) {
      student.class = req.body.class;
      student.feeAmount = getFeeForClass(req.body.class);
    }
    if (req.body.password) student.password = req.body.password;

    await student.save();
    res.json(student.toSafeObject());
  } catch (error) {
    next(error);
  }
});

router.get("/payments", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.month) query.month = req.query.month;
    const payments = await Payment.find(query)
      .populate("studentId", "name username class feeAmount feeStatus")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

const syncStudentHistory = async (payment) => {
  const student = await Student.findById(payment.studentId);
  if (!student) return;
  student.feeStatus = payment.status === "Accepted" ? "Paid" : payment.status === "Rejected" ? "Rejected" : "Pending";
  const historyItem = student.paymentHistory.find((item) => String(item.paymentId) === String(payment._id));
  if (historyItem) {
    historyItem.status = payment.status;
    historyItem.paidAt = payment.status === "Accepted" ? new Date() : undefined;
  }
  await student.save();
};

router.put("/approve", [body("paymentId").notEmpty().withMessage("Payment ID is required")], validate, async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.body.paymentId, { status: "Accepted" }, { new: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    await syncStudentHistory(payment);
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

router.put("/reject", [body("paymentId").notEmpty().withMessage("Payment ID is required")], validate, async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.body.paymentId, { status: "Rejected" }, { new: true });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    await syncStudentHistory(payment);
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

router.get("/export/fees.csv", async (_req, res, next) => {
  try {
    const payments = await Payment.find().populate("studentId", "name username class").sort({ createdAt: -1 });
    const rows = [
      ["Student", "Username", "Class", "Month", "Amount", "Mode", "Transaction ID", "Status", "Created At"],
      ...payments.map((payment) => [
        payment.studentId?.name || "",
        payment.studentId?.username || "",
        payment.studentId?.class || "",
        payment.month,
        payment.amount,
        payment.paymentMode,
        payment.transactionId || "",
        payment.status,
        payment.createdAt.toISOString()
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    res.header("Content-Type", "text/csv");
    res.attachment("fee-records.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;
