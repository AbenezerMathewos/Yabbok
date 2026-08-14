import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spiritual Mentorship | YABBOK Fellowship",
  description: "Connect with mature church leaders and mentors for biblical guidance and coaching.",
};

export default function MentorshipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
