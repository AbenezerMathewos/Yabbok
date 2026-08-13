import mongoose from "mongoose";
import User from "./src/backend/models/User";

async function run() {
  await mongoose.connect("mongodb://localhost:27017/yabbok");
  const result = await User.findOneAndUpdate(
    { email: "testadmin@example.com" },
    { role: "super_admin", status: "active" },
    { new: true }
  );
  console.log("Updated user:", result?.email, result?.role, result?.status);
  mongoose.disconnect();
}
run();
