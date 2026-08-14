import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prayer Request & Testimony Wall | YABBOK Fellowship",
  description: "Share prayer requests, join in community intercession, and celebrate answered testimonies.",
};

export default function PrayerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
