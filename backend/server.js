import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(cors({
 origin:function(origin,callback){
   const allowedOrigins=[
     "http://localhost:5173",
     "https://adventus2.vercel.app"
   ];

   if(
     !origin ||
     allowedOrigins.includes(origin) ||
     origin.endsWith(".vercel.app")
   ){
      callback(null,true);
   } else {
      callback(new Error("Not allowed by CORS"));
   }
 },
 credentials:true
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Tuition Management System API is running" });
});

app.use("/api", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
