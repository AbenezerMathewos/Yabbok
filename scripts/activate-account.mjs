/**
 * YABBOK — One-time local dev account activator
 * Uses only Node.js built-ins (no external packages needed)
 * Usage: node scripts/activate-account.mjs <email>
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createConnection } from "net";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Parse .env.local manually ---
function loadEnv(envPath) {
  const env = {};
  try {
    const lines = readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      env[key] = val;
    }
  } catch { /* file not found */ }
  return env;
}

const env = loadEnv(resolve(__dirname, "../.env.local"));
const MONGODB_URI = env.MONGODB_URI || process.env.MONGODB_URI;

const email = process.argv[2];

if (!email) {
  console.error("\n❌  Usage: node scripts/activate-account.mjs <your@email.com>\n");
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error("\n❌  MONGODB_URI not found in .env.local\n");
  process.exit(1);
}

// --- Dynamically import mongodb from the project's node_modules ---
const { MongoClient } = await import(
  resolve(__dirname, "../node_modules/mongodb/lib/index.js")
).catch(() => {
  // fallback: try to load via require-style path
  return import("mongodb");
});

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  console.log("\n✅  Connected to MongoDB...");

  const db = client.db();
  const users = db.collection("users");

  // List all users first
  const allUsers = await users.find({}, { projection: { email: 1, status: 1, role: 1 } }).toArray();
  if (allUsers.length === 0) {
    console.log("\n⚠️   No users found in the database.");
    console.log("    Please register at http://localhost:3000/register first.\n");
    process.exit(0);
  }

  console.log("\n📋  Users in database:");
  allUsers.forEach((u) => {
    const isTarget = u.email === email.toLowerCase();
    console.log(`    ${isTarget ? "→" : " "} ${u.email}  [status: ${u.status}, role: ${u.role}]`);
  });

  const result = await users.updateOne(
    { email: email.toLowerCase() },
    { $set: { status: "active", role: "super_admin" } }
  );

  if (result.matchedCount === 0) {
    console.error(`\n❌  No user found with email: ${email}`);
    console.log("    Check the email addresses listed above.\n");
  } else {
    console.log(`\n🎉  Account activated!`);
    console.log(`    Email : ${email}`);
    console.log(`    Status: active`);
    console.log(`    Role  : super_admin`);
    console.log(`\n    ➜  Log in now at http://localhost:3000/login\n`);
  }
} catch (err) {
  console.error("\n❌  Error:", err.message);
  if (err.message.includes("ECONNREFUSED") || err.message.includes("connect")) {
    console.log("\n    ⚠️  Could not connect to MongoDB.");
    console.log("    Make sure MongoDB is running locally, or check your MONGODB_URI in .env.local\n");
  }
} finally {
  await client.close();
}
