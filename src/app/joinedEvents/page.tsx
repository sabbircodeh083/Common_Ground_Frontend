import type { Metadata } from "next";
import JoinedEventsCardHolder from "@/components/joinedEventCardHolder";

export const metadata: Metadata = {
  title: "Upcoming Events | CommonGround",
  description:
    "Discover and join the latest events happening in our community.",
};

export default function UpcomingEventsPage() {
  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#fbf1e4] px-4 py-10 font-sans sm:px-8 sm:py-14 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <header>
          <p className="flex items-center gap-2 text-[13.5px] font-bold text-forest">
            <i
              aria-hidden="true"
              className="fa-regular fa-calendar-days text-[0.95em]"
            />
            Community Events
          </p>
          <h1 className="mt-2.5 font-serif text-[2.1rem] font-black tracking-tight text-forest sm:text-[2.6rem]">
            Joined Events
          </h1>
          <p className="mt-2 text-[14.5px] font-medium text-forest/70 sm:text-base">
            All the events you&apos;ve joined, Stay updated and be part of
            change.
          </p>
        </header>

        <JoinedEventsCardHolder />
      </div>
    </section>
  );
}
