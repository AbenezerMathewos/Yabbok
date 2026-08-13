import mongoose from "mongoose";
import Church from "./src/backend/models/Church";

async function run() {
  await mongoose.connect("mongodb://localhost:27017/yabbok");
  const existingChurch = await Church.findOne({ name: "KHC Adama" });
  if (!existingChurch) {
    const church = await Church.create({
      name: "KHC Adama",
      city: "Adama",
      region: "Oromia",
      description: "Adama Kale Hiywet Church",
      memberCount: 1500,
      status: "verified"
    });
    console.log("Created church:", church.name);
  } else {
    console.log("Church already exists");
  }
  mongoose.disconnect();
}
run();
