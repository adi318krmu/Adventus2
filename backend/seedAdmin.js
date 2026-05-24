import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";
import { makeTuitionId } from "./idUtils.js";

dotenv.config();
await connectDB();

const username = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123";

const admin = await Admin.findOne({ username });
if (admin) {
  console.log(`Admin already exists: ${username}`);
} else {
  await Admin.create({ username, password, tuitionId: makeTuitionId("admin") });
  console.log(`Admin created: ${username}`);
}

process.exit(0);
