import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/backend/models/User";

async function run() {
  await mongoose.connect("mongodb://localhost:27017/yabbok");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const result = await User.findOneAndUpdate(
    { email: "testadmin@example.com" },
    { password: hashedPassword, role: "super_admin", status: "active" },
    { new: true, upsert: true }
  );
  console.log("Updated user password:", result?.email);
  mongoose.disconnect();
}
run();
