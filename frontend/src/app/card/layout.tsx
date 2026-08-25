import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Member ID Card | YABBOK Fellowship",
  description: "View and print your official YABBOK Youth Fellowship digital membership pass with QR code.",
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
