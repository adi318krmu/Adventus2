import express from "express";
import { body, validationResult } from "express-validator";
import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import { protectStudent, protectAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { getFeeForClass } from "../utils.js";
import { makeTuitionId } from "../idUtils.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.get("/profile", protectStudent, async (req, res) => {
  res.json(req.user);
});

router.put(
  "/profile",
  protectStudent,
  upload.single("profilePhoto"),
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("class").optional().trim().notEmpty().withMessage("Class cannot be empty")
  ],
  validate,
  async (req, res, next) => {
    try {
      const student = await Student.findById(req.user._id);
      if (req.body.name) student.name = req.body.name;
      if (req.body.class) {
        student.class = req.body.class;
        student.feeAmount = getFeeForClass(req.body.class);
      }
      if (!student.tuitionId) student.tuitionId = makeTuitionId("student");
      if (req.file) student.profilePhoto = `/uploads/${req.file.filename}`;
      await student.save();
      res.json(student.toSafeObject());
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", protectAdmin, async (req, res, next) => {
  try {
    await Payment.deleteMany({ studentId: req.params.id });
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
