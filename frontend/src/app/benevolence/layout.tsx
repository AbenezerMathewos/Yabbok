import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crisis Benevolence Fund | YABBOK Fellowship",
  description: "Financial assistance and hardship support for church fellowship members in crisis.",
};

export default function BenevolenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
