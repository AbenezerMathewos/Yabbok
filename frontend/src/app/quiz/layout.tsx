import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Bible Study Quiz | YABBOK Fellowship",
  description: "Test your Bible knowledge, answer discipleship questions, and earn spiritual achievement badges.",
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
