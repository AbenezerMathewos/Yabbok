import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer & Skills Mobilization | YABBOK Fellowship",
  description: "Serve the church and community by offering your skills, time, and talent.",
};

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
