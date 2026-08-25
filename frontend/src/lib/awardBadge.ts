import Badge from "@/backend/models/Badge";
import { connectToDatabase } from "@/backend/lib/mongodb";

/**
 * Idempotently awards a badge to a user.
 * Returns the Badge document if newly awarded, null if already had it.
 */
export async function awardBadge(
  userId: string,
  badgeId: string
): Promise<{ badgeId: string; earnedAt: Date } | null> {
  await connectToDatabase();

  const existing = await Badge.findOne({ user: userId, badgeId });
  if (existing) return null; // Already earned

  const badge = await Badge.create({ user: userId, badgeId, earnedAt: new Date() });
  return { badgeId: badge.badgeId, earnedAt: badge.earnedAt };
}
