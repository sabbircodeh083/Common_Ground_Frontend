import type { Metadata } from "next";
import { Suspense } from "react";
import EventDetails, { EventDetailsSkeleton } from "@/components/EventDetails";

export const metadata: Metadata = {
  title: "Event Details | CommonGround",
  description:
    "View event details, meet the organizer, and join the upcoming community initiative.",
};

export default function EventDetailsPage() {
  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#f4f4f1] px-4 py-8 font-sans sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-280">
        <Suspense fallback={<EventDetailsSkeleton />}>
          <EventDetails />
        </Suspense>
      </div>
    </section>
  );
}
