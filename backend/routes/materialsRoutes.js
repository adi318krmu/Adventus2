import express from "express";
import { body, validationResult } from "express-validator";
import fs from "fs";
import path from "path";
import StudyMaterial from "../models/StudyMaterial.js";
import { protectAdmin, protectAny } from "../middleware/auth.js";
import { uploadMaterial } from "../middleware/upload.js";
import { isValidClass } from "../utils.js";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If validation fails and file was uploaded, remove it
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Error handler wrapper for Multer file filter errors
const uploadHandler = (req, res, next) => {
  uploadMaterial.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Create Study Material
router.post(
  "/",
  protectAdmin,
  uploadHandler,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().trim(),
    body("subject").trim().notEmpty().withMessage("Subject is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File upload is required" });
      }

      let classes = [];
      if (Array.isArray(req.body.class)) {
        classes = req.body.class;
      } else if (typeof req.body.class === "string") {
        classes = req.body.class.split(",").map((c) => c.trim()).filter(Boolean);
      }

      if (classes.length === 0) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ message: "At least one target class is required" });
      }

      // Validate each class
      for (const cls of classes) {
        if (!isValidClass(cls)) {
          if (req.file) fs.unlink(req.file.path, () => {});
          return res.status(400).json({ message: `Class ${cls} must be from 4 to 10` });
        }
      }

      let fileData = "";
      if (req.file) {
        try {
          const fileBuffer = req.file.buffer ? req.file.buffer : fs.readFileSync(req.file.path);
          fileData = fileBuffer.toString("base64");
        } catch (err) {
          console.error("Error reading file buffer for MongoDB fallback:", err);
        }
      }

      const material = await StudyMaterial.create({
        title: req.body.title,
        description: req.body.description || "",
        subject: req.body.subject,
        class: classes,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl: req.file.path,
        fileData,
        uploadedBy: req.user._id
      });

      res.status(201).json(material);
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      next(error);
    }
  }
);

// Get All Study Materials
router.get("/", protectAny, async (req, res, next) => {
  try {
    const query = {};

    // Enforce class restriction for students
    if (req.role === "student") {
      query.class = req.user.class;
    } else {
      // Admins can filter by class
      if (req.query.class) {
        query.class = req.query.class;
      }
    }

    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, "i") },
        { description: new RegExp(req.query.search, "i") }
      ];
    }

    const materials = await StudyMaterial.find(query)
      .populate("uploadedBy", "username")
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    next(error);
  }
});

const hasStudentAccess = (material, studentClass) => {
  if (!material || !material.class) return false;
  const targetClass = String(studentClass || "").trim();
  if (!targetClass) return false;

  if (Array.isArray(material.class)) {
    return material.class.some((c) => String(c).trim() === targetClass);
  }
  return String(material.class).trim() === targetClass;
};

// Get Single Study Material
router.get("/:id", protectAny, async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id).populate("uploadedBy", "username");
    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    // Verify class restriction for students
    if (req.role === "student" && !hasStudentAccess(material, req.user.class)) {
      return res.status(403).json({ message: "Access denied to this study material" });
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
});

// Update Study Material
router.put(
  "/:id",
  protectAdmin,
  uploadHandler,
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().trim(),
    body("subject").optional().trim().notEmpty().withMessage("Subject cannot be empty")
  ],
  validate,
  async (req, res, next) => {
    try {
      const material = await StudyMaterial.findById(req.params.id);
      if (!material) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(404).json({ message: "Study material not found" });
      }

      if (req.body.title) material.title = req.body.title;
      if (req.body.description !== undefined) material.description = req.body.description;
      if (req.body.subject) material.subject = req.body.subject;
      
      if (req.body.class) {
        let classes = [];
        if (Array.isArray(req.body.class)) {
          classes = req.body.class;
        } else if (typeof req.body.class === "string") {
          classes = req.body.class.split(",").map((c) => c.trim()).filter(Boolean);
        }
        for (const cls of classes) {
          if (!isValidClass(cls)) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(400).json({ message: `Class ${cls} must be from 4 to 10` });
          }
        }
        material.class = classes;
      }

      // If a new file is uploaded, swap it and delete the old one
      if (req.file) {
        const oldPath = material.fileUrl;
        material.fileName = req.file.originalname;
        material.fileType = req.file.mimetype;
        material.fileUrl = req.file.path;

        try {
          const fileBuffer = req.file.buffer ? req.file.buffer : fs.readFileSync(req.file.path);
          material.fileData = fileBuffer.toString("base64");
        } catch (err) {
          console.error("Error reading file buffer for MongoDB fallback:", err);
        }

        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, () => {});
        }
      }

      await material.save();
      res.json(material);
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      next(error);
    }
  }
);

// Delete Study Material
router.delete("/:id", protectAdmin, async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    const filePath = material.fileUrl;
    await StudyMaterial.findByIdAndDelete(req.params.id);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }

    res.json({ message: "Study material deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Download / View Study Material File
router.get("/download/:id", protectAny, async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Study material not found" });
    }

    // Verify class restriction for students
    if (req.role === "student" && !hasStudentAccess(material, req.user.class)) {
      return res.status(403).json({ message: "Access denied to this study material" });
    }

    if (req.query.download === "true") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(material.fileName)}"`
      );
    } else {
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(material.fileName)}"`
      );
    }

    res.setHeader("Content-Type", material.fileType);

    // 1. Check local physical file path variations
    const potentialPaths = [
      path.resolve(material.fileUrl),
      path.join(process.cwd(), material.fileUrl),
      path.join(process.cwd(), "study-materials", path.basename(material.fileUrl)),
      path.join(process.cwd(), "uploads", path.basename(material.fileUrl))
    ];

    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        return res.sendFile(p);
      }
    }

    // 2. Check Base64 fileData stored in MongoDB (for Render or ephemeral servers)
    if (material.fileData) {
      const buffer = Buffer.from(material.fileData, "base64");
      res.setHeader("Content-Length", buffer.length);
      return res.end(buffer);
    }

    // 3. Fallback for external URL
    if (material.fileUrl && (material.fileUrl.startsWith("http://") || material.fileUrl.startsWith("https://"))) {
      return res.redirect(material.fileUrl);
    }

    return res.status(404).json({
      message: "Physical file not found on server disk. Please ask the teacher or admin to re-upload this file."
    });
  } catch (error) {
    next(error);
  }
});

export default router;
