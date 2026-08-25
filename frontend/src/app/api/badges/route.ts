import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Badge from "@/backend/models/Badge";

const DEFAULT_BADGES = [
  {
    badgeId: "bible_scholar",
    nameEn: "Bible Scholar",
    nameAm: "የመጽሐፍ ቅዱስ አዋቂ",
    descriptionEn: "Completed Bible study trivia quizzes with distinction.",
    descriptionAm: "የመጽሐፍ ቅዱስ ጥያቄዎችን በብቃት አጠናቀዋል።",
    icon: "🎓",
    category: "quiz",
  },
  {
    badgeId: "prayer_warrior",
    nameEn: "Prayer Warrior",
    nameAm: "የጸሎት ተጋዳላይ",
    descriptionEn: "Interceded for 10+ prayer requests on the Prayer Wall.",
    descriptionAm: "በጸሎት ግድግዳ ላይ ከ10 በላይ ለሆኑ ጸሎቶች ተጋድለዋል።",
    icon: "🙏",
    category: "prayer",
  },
  {
    badgeId: "devotional_master",
    nameEn: "Devotional Master",
    nameAm: "የእለት ቃል አጥኚ",
    descriptionEn: "Maintained a 7-day Quiet Time reading streak.",
    descriptionAm: "ለ7 ተከታታይ நாட்க የቃል ጥናትን አጠናቀዋል።",
    icon: "🔥",
    category: "devotional",
  },
  {
    badgeId: "fellowship_anchor",
    nameEn: "Fellowship Anchor",
    nameAm: "የህብረት መሠረት",
    descriptionEn: "RSVPed and attended 3+ YABBOK youth conferences.",
    descriptionAm: "በ3+ የያቦቅ ወጣቶች ኮንፈረንስ ላይ ተገኝተዋል።",
    icon: "⚓",
    category: "fellowship",
  },
];

export async function GET() {
  try {
    const userObj = await getCurrentUser();
    let userBadges: any[] = [];

    if (userObj) {
      await connectToDatabase();
      userBadges = await Badge.find({ user: userObj.id }).lean();
    }

    const userBadgeIds = userBadges.map((b) => b.badgeId);

    const fullBadgeList = DEFAULT_BADGES.map((b) => ({
      ...b,
      unlocked: userBadgeIds.includes(b.badgeId),
      earnedAt: userBadges.find((ub) => ub.badgeId === b.badgeId)?.earnedAt || null,
    }));

    return NextResponse.json({
      badges: fullBadgeList,
      totalUnlocked: userBadges.length,
    });
  } catch (err) {
    return NextResponse.json({ badges: DEFAULT_BADGES.map(b => ({ ...b, unlocked: false })), totalUnlocked: 0 });
  }
}
