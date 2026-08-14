import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mutual Aid Network | YABBOK Fellowship",
  description: "Peer-to-peer resource sharing, financial support, and emergency community aid.",
};

export default function MutualAidLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
