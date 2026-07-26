import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    class: { type: [String], required: true },
    fileName: { type: String, required: true, trim: true },
    fileType: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("StudyMaterial", studyMaterialSchema);
