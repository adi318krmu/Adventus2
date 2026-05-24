import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import { getFeeForClass, isValidClass } from "../utils.js";
import { makeTuitionId } from "../idUtils.js";

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
    const admin = await Admin.findOne({ profilePhoto: { $ne: "" } })
      .select("profilePhoto")
      .sort({ updatedAt: -1 });

    res.json({
      text: "Aditya Singh • Kaizen Sensei",
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
    body("class").trim().custom(isValidClass).withMessage("Class must be from 4 to 10"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, name, password } = req.body;
      const studentClass = req.body.class;
      const exists = await Student.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Username already exists" });

      const student = await Student.create({
        username,
        tuitionId: makeTuitionId("student"),
        name,
        class: studentClass,
        password,
        feeAmount: getFeeForClass(studentClass)
      });

      res.status(201).json({
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

export default router;
