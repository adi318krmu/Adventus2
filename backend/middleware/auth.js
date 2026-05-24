import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";

const readToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
};

export const protectStudent = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "student") return res.status(403).json({ message: "Student access required" });

    const student = await Student.findById(decoded.id).select("-password");
    if (!student) return res.status(401).json({ message: "Student not found" });

    req.user = student;
    req.role = "student";
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const protectAdmin = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ message: "Admin access required" });

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.user = admin;
    req.role = "admin";
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
