import { EventsExperience } from "@/frontend/components/events/EventsExperience";
import { Footer } from "@/frontend/components/shared/Footer";
import { Navbar } from "@/frontend/components/shared/Navbar";

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <EventsExperience />
      <Footer />
    </>
  );
}
