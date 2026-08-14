import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Quiet Time & Scripture Devotional | YABBOK Fellowship",
  description: "Bilingual daily Scripture reading, spiritual reflections, and Quiet Time streak tracker.",
};

export default function DevotionalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
