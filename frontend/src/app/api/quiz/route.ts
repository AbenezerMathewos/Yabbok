import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Badge from "@/backend/models/Badge";

const SAMPLE_QUIZ = {
  _id: "quiz_youth_discipleship_01",
  titleEn: "Youth Discipleship & Bible Trivia",
  titleAm: "የወጣቶች ደቀ መዝሙርነት እና የመጽሐፍ ቅዱስ ጥያቄዎች",
  category: "New Testament & Psalms",
  passage: "Jeremiah 29:11 / ኤርምያስ 29፡11",
  questions: [
    {
      id: "q1",
      questionEn: "Who did Jesus promise to send to guide believers into all truth?",
      questionAm: "ኢየሱስ አማኞችን ወደ እውነት ሁሉ እንዲመራ እንደሚልክ ቃል የገባው ማንን ነው?",
      optionsEn: ["The Holy Spirit", "An Angel", "Moses", "Elijah"],
      optionsAm: ["መንፈስ ቅዱስ", "መልአክ", "ሙሴ", "ኤልያስ"],
      correctIndex: 0,
      explanationEn: "John 16:13 - But when he, the Spirit of truth, comes, he will guide you into all the truth.",
      explanationAm: "ዮሐንስ 16፡13 - እርሱ የእውነት መንፈስ በመጣ ጊዜ ወደ እውነት ሁሉ ይመራችኋል።",
      points: 10,
    },
    {
      id: "q2",
      questionEn: "Which verse states 'The LORD is my shepherd; I shall not want'?",
      questionAm: "'እግዚአብሔር እረኛዬ ነው የሚያስፈልገኝም አላጣም' የሚለው ጥቅስ የትኛው ነው?",
      optionsEn: ["Psalm 23:1", "Psalm 91:1", "John 3:16", "Romans 8:28"],
      optionsAm: ["መዝሙር 23፡1", "መዝሙር 91፡1", "ዮሐንስ 3፡16", "ሮሜ 8፡28"],
      correctIndex: 0,
      explanationEn: "Psalm 23:1 is David's famous psalm of God's protection and provision.",
      explanationAm: "መዝሙር 23፡1 የእግዚአብሔርን እረኝነት የሚያስረዳ የታወቀው የዳዊት መዝሙር ነው።",
      points: 10,
    },
    {
      id: "q3",
      questionEn: "What is the Fruit of the Spirit listed first in Galatians 5:22?",
      questionAm: "በገላትያ 5፡22 ላይ የመንፈስ ፍሬ ተብሎ በመጀመሪያ የተጠቀሰው የትኛው ነው?",
      optionsEn: ["Love", "Joy", "Peace", "Patience"],
      optionsAm: ["ፍቅር", "ደስታ", "ሰላም", "ትዕግሥት"],
      correctIndex: 0,
      explanationEn: "Galatians 5:22 - But the fruit of the Spirit is love, joy, peace, forbearance, kindness...",
      explanationAm: "ገላትያ 5፡22 - የመንፈስ ፍሬ ግን ፍቅር፥ ደስታ፥ ሰላም፥ ትዕግሥት፥ ቸርነት...",
      points: 10,
    },
  ],
};

export async function GET() {
  return NextResponse.json(SAMPLE_QUIZ);
}

export async function POST(req: Request) {
  try {
    const userObj = await getCurrentUser();
    const { answers } = await req.json();

    let score = 0;
    let totalPoints = 0;

    SAMPLE_QUIZ.questions.forEach((q, idx) => {
      totalPoints += q.points;
      if (answers[q.id] === q.correctIndex) {
        score += q.points;
      }
    });

    const passed = score >= 20;
    let unlockedBadge = null;

    if (userObj && passed) {
      await connectToDatabase();
      const existingBadge = await Badge.findOne({ user: userObj.id, badgeId: "bible_scholar" });
      if (!existingBadge) {
        unlockedBadge = await Badge.create({
          user: userObj.id,
          badgeId: "bible_scholar",
          nameEn: "Bible Scholar",
          nameAm: "የመጽሐፍ ቅዱስ አዋቂ",
          descriptionEn: "Passed the Youth Discipleship & Bible Trivia Quiz with distinction!",
          descriptionAm: "የወጣቶች መጽሐፍ ቅዱስ ጥያቄዎችን በብቃት ተወጥተዋል!",
          icon: "🎓",
          category: "quiz",
        });
      }
    }

    return NextResponse.json({
      score,
      totalPoints,
      percentage: Math.round((score / totalPoints) * 100),
      passed,
      unlockedBadge,
    });
  } catch (err) {
    return handleApiError(err, "Failed to submit quiz");
  }
}
