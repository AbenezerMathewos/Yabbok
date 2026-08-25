import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Church from "@/backend/models/Church";
import User from "@/backend/models/User";
import Sermon from "@/backend/models/Sermon";
import Event from "@/backend/models/Event";
import Devotional from "@/backend/models/Devotional";
import Prayer from "@/backend/models/Prayer";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  // ── Security guard ───────────────────────────────────────────────────────
  // Disabled in production. In development, requires X-Seed-Secret header.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  const seedSecret = process.env.SEED_SECRET;
  const providedSecret = req.headers.get("x-seed-secret");
  if (!seedSecret || providedSecret !== seedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    await connectToDatabase();

    // 1. Seed Churches
    let church = await Church.findOne({ name: "Addis Ababa Central KHC" });
    if (!church) {
      church = await Church.create({
        name: "Addis Ababa Central KHC",
        city: "Addis Ababa",
        region: "Addis Ababa",
        description: "Main youth fellowship center in the heart of Addis Ababa.",
        memberCount: 350,
        status: "verified",
      });
    }

    let church2 = await Church.findOne({ name: "Hawassa Youth KHC" });
    if (!church2) {
      church2 = await Church.create({
        name: "Hawassa Youth KHC",
        city: "Hawassa",
        region: "Sidama",
        description: "Vibrant regional youth fellowship center near Lake Hawassa.",
        memberCount: 220,
        status: "verified",
      });
    }

    // 2. Seed Super Admin User
    const adminEmail = "admin@yabbok.org";
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      adminUser = await User.create({
        name: "YABBOK Super Admin",
        email: adminEmail,
        phone: "+251911223344",
        password: hashedPassword,
        gender: "male",
        dob: new Date("1995-01-01"),
        churchId: church._id,
        churchBranch: "Central Youth",
        region: "Addis Ababa",
        profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
        ministryAreas: ["Youth Leadership", "Media Team"],
        educationalStatus: "Graduate",
        bio: "Serving as platform administrator for YABBOK Youth Fellowship.",
        role: "super_admin",
        status: "active",
        emailVerified: true,
      });
    }

    // 3. Seed Sample Sermons
    const sermonCount = await Sermon.countDocuments();
    if (sermonCount === 0) {
      await Sermon.create({
        title: "Walking in Divine Identity & Purpose",
        speaker: "Pastor Dawit Abrham",
        category: "Discipleship",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "An empowering message on knowing your true identity in Christ during youth.",
        date: new Date(),
        approvalStatus: "approved",
      });
      await Sermon.create({
        title: "The Power of Persistent Prayer (የጸሎት ኃይል)",
        speaker: "Evangelist Hannah Samuel",
        category: "Prayer & Worship",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        description: "Deepening your quiet time communion with God.",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        approvalStatus: "approved",
      });
    }

    // 4. Seed Sample Events
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.create({
        title: "National Youth Conference 2026",
        description: "Uniting 1,000+ youth leaders across Ethiopia for a 3-day spiritual retreat.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "Hawassa Convention Hall",
        category: "Retreat",
        isLive: true,
        livePlatform: "YouTube Live",
        liveMeetingUrl: "https://youtube.com/live_stream",
        approvalStatus: "approved",
      });
      await Event.create({
        title: "Hawassa Praise & Worship Night",
        description: "An evening of prayer, intercession, and uplifting worship.",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: "Hawassa Youth KHC Auditorium",
        category: "Prayer Night",
        isLive: false,
        livePlatform: "None",
        approvalStatus: "approved",
      });
    }

    // 5. Seed Sample Devotional
    const devCount = await Devotional.countDocuments();
    if (devCount === 0) {
      await Devotional.create({
        date: new Date(),
        passage: "Jeremiah 29:11 / ኤርምያስ 29፡11",
        titleEn: "God's Plans for Your Future",
        titleAm: "የእግዚአብሔር መልካም አሳብ ለህይወትዎ",
        contentEn: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
        contentAm: "ለእናንተ የማስበውን አሳብ እኔ አውቃለሁ፤ የፍጻሜውን ተስፋ እሰጣችሁ ዘንድ የሰላም አሳብ ነው እንጂ የክፉ አይደለም።",
        reflectionEn: "How does knowing God controls your future give you peace today?",
        reflectionAm: "እግዚአብሔር የመልካም ተስፋ አምላክ መሆኑ በህይወትዎ ውስጥ ምን አይነት እፎይታ ይሰጥዎታል?",
      });
    }

    // 6. Seed Sample Prayers
    const prayerCount = await Prayer.countDocuments();
    if (prayerCount === 0) {
      await Prayer.create({
        user: adminUser._id,
        title: "Prayer for University Exams & Wisdom",
        description: "Please pray for peace and wisdom during final semester exams.",
        category: "guidance",
        isAnonymous: false,
        prayedCount: 18,
        status: "active",
      });
      await Prayer.create({
        user: adminUser._id,
        title: "Testimony: Healing and Restoration!",
        description: "Praise God! The Lord answered our prayers for my mother's complete health recovery.",
        category: "healing",
        isAnonymous: false,
        prayedCount: 42,
        status: "answered",
        testimony: "Thanking God for His faithfulness!",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with admin user, churches, sermons, events, devotionals, and prayers!",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
