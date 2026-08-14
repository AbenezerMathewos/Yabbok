import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Worship & Conference Stream | YABBOK Fellowship",
  description: "Watch live youth services, conferences, and listen to low-data live audio radio stream.",
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
