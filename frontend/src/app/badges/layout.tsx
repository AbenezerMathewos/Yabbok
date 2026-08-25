import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Youth Achievement Badges | YABBOK Fellowship",
  description: "View earned spiritual achievement badges, quiet time streaks, and youth leaderboards.",
};

export default function BadgesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
