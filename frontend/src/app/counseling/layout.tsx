import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pastoral Counseling & Triage | YABBOK Fellowship",
  description: "Secure, 100% confidential pastoral counseling and prayer request portal.",
};

export default function CounselingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
