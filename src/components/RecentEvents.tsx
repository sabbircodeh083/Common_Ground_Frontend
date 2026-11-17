"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import EventCard from "@/components/EventCard";
import type { EventData } from "@/components/EventCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_EVENTS = 6;

type LoadStatus = "loading" | "success" | "error";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isUpcoming(date: string) {
  const eventDate = new Date(`${date}T00:00:00`);
  return !Number.isNaN(eventDate.getTime()) && eventDate >= startOfToday();
}

export default function RecentEvents() {
  const trackRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<EventData[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [perView, setPerView] = useState(() =>
    typeof window === "undefined"
      ? 3
      : window.innerWidth >= 1024
        ? 3
        : window.innerWidth >= 640
          ? 2
          : 1,
  );
  const [page, setPage] = useState(0);
  const perViewRef = useRef(perView);

  const pages = Math.max(1, Math.ceil(events.length / perView));

  useEffect(() => {
    function updatePerView() {
      const width = window.innerWidth;
      const nextPerView = width >= 1024 ? 3 : width >= 640 ? 2 : 1;

      if (perViewRef.current === nextPerView) return;

      perViewRef.current = nextPerView;
      setPerView(nextPerView);
      setPage(0);
      trackRef.current?.scrollTo({ left: 0 });
    }

    window.addEventListener("resize", updatePerView);

    return () => window.removeEventListener("resize", updatePerView);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setStatus("loading");
      setErrorMessage("");

      if (!API_URL) {
        setStatus("error");
        setErrorMessage(
          "NEXT_PUBLIC_API_URL is not configured. Restart the dev server after updating .env.",
        );
        return;
      }

      try {
        const response = await fetch(`${API_URL}/events-recent6`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `The server responded with ${response.status} ${response.statusText}.`,
          );
        }

        const data: unknown = await response.json();
        const list: EventData[] = Array.isArray(data) ? data : [];

        const upcoming = list
          .filter(
            (event) => typeof event?.date === "string" && isUpcoming(event.date),
          )
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, MAX_EVENTS);

        setEvents(upcoming);
        setStatus("success");
        setPage(0);
        trackRef.current?.scrollTo({ left: 0 });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Failed to load recent events", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
      }
    }

    loadEvents();

    return () => controller.abort();
  }, [reloadToken]);

  function handleTrackScroll() {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.querySelectorAll<HTMLElement>("[data-event-card]");
    if (cards.length < 2) {
      setPage(0);
      return;
    }

    const cardStep = cards[1].offsetLeft - cards[0].offsetLeft;
    if (cardStep <= 0) return;

    const cardIndex = Math.round(track.scrollLeft / cardStep);
    setPage(Math.min(pages - 1, Math.floor(cardIndex / perView)));
  }

  function goToPage(nextPage: number) {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.querySelectorAll<HTMLElement>("[data-event-card]");
    if (cards.length === 0) return;

    const targetIndex = Math.min(nextPage * perView, cards.length - 1);
    const left = cards[targetIndex].offsetLeft - cards[0].offsetLeft;

    track.scrollTo({ left, behavior: "smooth" });
    setPage(nextPage);
  }

  return (
    <section
      aria-labelledby="recent-events-heading"
      className="bg-[#fbf1e4] px-4 pb-12 font-sans sm:px-8 sm:pb-14 lg:px-14"
    >
      <div className="mx-auto w-full max-w-[1720px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[13.5px] font-bold text-forest">
              <i
                aria-hidden="true"
                className="fa-regular fa-calendar-days text-[0.95em]"
              />
              Community Events
            </p>
            <h2
              id="recent-events-heading"
              className="mt-2 font-serif text-[2rem] font-black tracking-tight text-forest sm:text-[2.5rem]"
            >
              Recent Upcoming Events
            </h2>
            <p className="mt-2 text-[14.5px] font-medium text-forest/70 sm:text-base">
              Discover and join the latest events happening in our community.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex shrink-0 items-center gap-3 self-start rounded-lg border border-forest px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-forest transition-colors hover:bg-forest hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf1e4] sm:self-auto"
          >
            All Events
            <i aria-hidden="true" className="fa-solid fa-arrow-right" />
          </Link>
        </div>

        {status === "loading" && (
          <div
            aria-busy="true"
            aria-live="polite"
            className="mt-7 flex gap-5 overflow-hidden"
          >
            <span className="sr-only">Loading recent events…</span>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-full shrink-0 overflow-hidden rounded-2xl border border-[#DDDCCB] bg-[#FFFEF8] shadow-sm sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] ${
                  index === 1 ? "hidden sm:block" : ""
                } ${index === 2 ? "hidden lg:block" : ""}`}
              >
                <div className="aspect-2/1 w-full animate-pulse bg-sand/50" />
                <div className="space-y-3 p-5">
                  <div className="h-3.5 w-2/5 animate-pulse rounded bg-sand/60" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-sand/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div
            role="alert"
            className="mt-7 flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2.5">
              <i
                aria-hidden="true"
                className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"
              />
              <p className="text-[13px] font-medium">
                Couldn&apos;t load upcoming events. {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReloadToken((token) => token + 1)}
              className="shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
            >
              Try again
            </button>
          </div>
        )}

        {status === "success" && events.length === 0 && (
          <div className="mt-7 rounded-2xl border border-dashed border-[#d8cfb9] bg-[#fffdf7] px-6 py-10 text-center">
            <p className="text-sm font-medium text-forest/70">
              No upcoming events right now. Check back soon or{" "}
              <Link
                href="/events/create"
                className="font-bold text-clay underline underline-offset-4"
              >
                create one
              </Link>
              .
            </p>
          </div>
        )}

        {status === "success" && events.length > 0 && (
          <>
            <div
              ref={trackRef}
              onScroll={handleTrackScroll}
              aria-label="Recent upcoming events"
              className="mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {events.map((event) => (
                <div
                  key={event._id}
                  data-event-card
                  className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4 sm:gap-6">
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-forest/70">
                {page + 1} / {pages}
              </span>

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4ddcc]">
                <div
                  className="h-full rounded-full bg-forest transition-[width] duration-300"
                  style={{ width: `${((page + 1) / pages) * 100}%` }}
                />
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  aria-label="Previous events"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/40 text-forest transition-colors hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <i aria-hidden="true" className="fa-solid fa-arrow-left" />
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(pages - 1, page + 1))}
                  disabled={page >= pages - 1}
                  aria-label="Next events"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream transition-colors hover:bg-[#0a3f28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf1e4] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <i aria-hidden="true" className="fa-solid fa-arrow-right" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
