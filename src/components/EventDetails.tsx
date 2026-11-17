"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { EventData } from "@/components/EventCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type EventDetailsData = EventData & {
  volunteerCount?: number;
};

type LoadStatus = "loading" | "success" | "error";

const CATEGORY_ICONS: Record<string, string> = {
  cleanup: "fa-broom",
  plantation: "fa-seedling",
  donation: "fa-hand-holding-heart",
  awareness: "fa-bullhorn",
};

const VOLUNTEER_GUIDELINES = [
  "Please arrive 15 minutes before the scheduled time at the designated location.",
  "Wear comfortable clothing suitable for physical work and distribution.",
  "Bring any pre-coordinated relief packages or distribution items if requested.",
];

function formatEventDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

/** Event descriptions are stored as the rich-text editor's HTML. */
function htmlToText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function EventDetails() {
  const params = useParams<{ EventId: string }>();
  const eventId = params?.EventId;

  const [event, setEvent] = useState<EventDetailsData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      setStatus("loading");
      setErrorMessage("");

      if (!API_URL) {
        setStatus("error");
        setErrorMessage(
          "NEXT_PUBLIC_API_URL is not configured. Restart the dev server after updating .env.",
        );
        return;
      }

      if (!eventId) {
        setStatus("error");
        setErrorMessage("This event could not be found.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/events/${encodeURIComponent(eventId)}`,
          { cache: "no-store", signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This event could not be found. It may have been removed."
              : `The server responded with ${response.status} ${response.statusText}.`,
          );
        }

        const data: EventDetailsData = await response.json();
        setEvent(data);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Failed to load event", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
      }
    }

    loadEvent();

    return () => controller.abort();
  }, [eventId, reloadToken]);

  async function handleShare() {
    if (!event) return;

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Couldn't share this event. Please try again.");
    }
  }

  function handleJoin() {
    // No join endpoint exists yet; keep the action honest instead of faking it.
    toast.info("Joining events is not available yet.");
  }

  if (status === "loading") {
    return <EventDetailsSkeleton />;
  }

  if (status === "error" || !event) {
    return (
      <>
        <BackLink />
        <div
          role="alert"
          className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <i
              aria-hidden="true"
              className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"
            />
            <div>
              <p className="text-sm font-bold">Couldn&apos;t load this event</p>
              <p className="mt-0.5 text-[13px] font-medium">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReloadToken((token) => token + 1)}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  const category = event.type.toLowerCase();
  const categoryIcon = CATEGORY_ICONS[category] ?? "fa-leaf";
  const description = htmlToText(event.description);
  const organizerName = event.organizerName.trim() || "Community Organizer";
  const organizerEmail = event.organizerEmail.trim();
  const volunteerCount = event.volunteerCount ?? 0;

  return (
    <>
      <BackLink />

      <div className="mt-4 rounded-4xl bg-[#fdfcf7] p-2.5 shadow-[0_30px_70px_-45px_rgba(17,54,34,0.45)] ring-1 ring-black/5 sm:p-3">
        {/* Hero */}
        <div className="relative aspect-16/7 min-h-70 w-full overflow-hidden rounded-[1.6rem] bg-forest/20">
          <Image
            src={event.thumbnailUrl || "/benner.png"}
            alt={event.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1120px"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/5"
          />

          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-[12.5px] font-bold text-forest shadow-sm backdrop-blur sm:left-6 sm:top-6">
            <i aria-hidden="true" className={`fa-solid ${categoryIcon}`} />
            <span className="capitalize">{event.type}</span>
          </span>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
            <h1 className="font-serif text-[1.9rem] font-black leading-tight tracking-tight text-white sm:text-[2.5rem]">
              {event.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold text-white/90 sm:text-[14px]">
              <span className="flex items-center gap-1.5">
                <i aria-hidden="true" className="fa-solid fa-location-dot" />
                {event.location}
              </span>
              <span
                aria-hidden="true"
                className="hidden h-4 w-px bg-white/30 sm:block"
              />
              <span className="flex items-center gap-1.5">
                <i aria-hidden="true" className="fa-regular fa-calendar" />
                {formatEventDate(event.date)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-2 pb-4 pt-5 sm:px-5 sm:pb-6 sm:pt-6">
          {/* Actions */}
          <div className="flex flex-col gap-4 rounded-2xl bg-[#f3f7ee] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e1ecd9] text-lg text-forest">
                <i aria-hidden="true" className="fa-solid fa-seedling" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-forest ">
                  <span className="text-blue-400">{volunteerCount}</span>/
                  <span className="text-blue-600">
                    {event.numberOfVolunteers}
                  </span>
                  Volunteers Joined
                </p>
                <p className="text-[13px] font-medium text-forest/60">
                  Sign up to join hands for this drive
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share this event"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#cfdcc5] bg-white text-forest transition-colors hover:bg-[#eef4e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
              >
                <i aria-hidden="true" className="fa-solid fa-share-nodes" />
              </button>
              <button
                type="button"
                onClick={handleJoin}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#17843f] px-6 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#126c33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17843f]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f7ee] sm:flex-none"
              >
                <i aria-hidden="true" className="fa-regular fa-heart" />
                Join Event
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <h2 className="text-[1.25rem] font-bold text-forest sm:text-[1.4rem]">
                About this Social Initiative
              </h2>
              <p className="mt-3 whitespace-pre-line text-[14.5px] leading-7 text-forest/75">
                {description || "No description provided for this event."}
              </p>

              <div className="mt-7 border-t border-[#e6e2d5] pt-6">
                <h3 className="text-[12.5px] font-extrabold uppercase tracking-[0.12em] text-[#2f8a3e]">
                  Volunteer Guidelines
                </h3>
                <ul className="mt-3.5 space-y-2.5">
                  {VOLUNTEER_GUIDELINES.map((guideline) => (
                    <li
                      key={guideline}
                      className="flex items-start gap-2.5 text-[13.5px] leading-6 font-medium text-forest/80"
                    >
                      <i
                        aria-hidden="true"
                        className="fa-solid fa-circle mt-2 text-[5px] text-[#2f8a3e]"
                      />
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Organizer */}
            <aside className="h-fit rounded-2xl border border-[#dfe5d5] bg-[#fdfefb] p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#2f8a3e]">
                Initiative Organizer
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest text-sm font-bold text-cream">
                  <span aria-hidden="true">
                    {initialsFromName(organizerName)}
                  </span>
                  {event.organizerImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.organizerImage}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(error) => {
                        error.currentTarget.style.display = "none";
                      }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-bold text-forest">
                    {organizerName}
                  </p>
                  {organizerEmail ? (
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-medium text-forest/60">
                      <i
                        aria-hidden="true"
                        className="fa-regular fa-envelope text-[11px]"
                      />
                      <span className="truncate">{organizerEmail}</span>
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[12.5px] font-medium text-forest/60">
                      Event organizer
                    </p>
                  )}
                </div>
              </div>

              <div className="my-4 border-t border-[#e6e2d5]" />

              <p className="flex items-center gap-2 text-[13px] font-semibold text-forest">
                <i
                  aria-hidden="true"
                  className="fa-regular fa-circle-check text-[#2f8a3e]"
                />
                Community Organizer
              </p>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/events"
      className="inline-flex items-center gap-2 text-[13px] font-semibold text-forest transition-colors hover:text-clay"
    >
      <i aria-hidden="true" className="fa-solid fa-arrow-left text-[11px]" />
      Back to Upcoming Events
    </Link>
  );
}

/** Static fallback used while route params stream in and while the event loads. */
export function EventDetailsSkeleton() {
  return (
    <>
      <BackLink />
      <div
        aria-busy="true"
        aria-live="polite"
        className="mt-4 rounded-4xl bg-[#fdfcf7] p-2.5 shadow-[0_30px_70px_-45px_rgba(17,54,34,0.45)] ring-1 ring-black/5 sm:p-3"
      >
        <span className="sr-only">Loading event details…</span>
        <div className="aspect-16/7 min-h-70 w-full animate-pulse rounded-[1.6rem] bg-sand/60" />
        <div className="space-y-4 px-3 py-7 sm:px-5">
          <div className="h-24 w-full animate-pulse rounded-2xl bg-sand/40" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-sand/60" />
              <div className="h-4 w-full animate-pulse rounded bg-sand/40" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-sand/40" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-sand/40" />
            </div>
            <div className="h-44 w-full animate-pulse rounded-2xl bg-sand/40" />
          </div>
        </div>
      </div>
    </>
  );
}
