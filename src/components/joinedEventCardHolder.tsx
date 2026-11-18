"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventData } from "@/components/EventCard";
import { useSessionContext } from "@/components/SessionProvider";
import JoinedEventCard from "./joinedEventCard";
import { getClientJwtToken } from "@/lib/Token/getClientToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiEvent = EventData & { _id?: string; eventId: string };

type LoadStatus = "loading" | "success" | "error";

const SKELETON_COUNT = 6;

function eventKey(event: ApiEvent, index: number) {
  return event._id ?? `${event.title}-${event.date}-${index}`;
}

function EventsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Loading joined events…</span>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#DDDCCB] bg-[#FFFEF8] shadow-sm"
        >
          <div className="aspect-2/1 w-full animate-pulse bg-sand/50" />
          <div className="space-y-3 p-5">
            <div className="h-3.5 w-2/5 animate-pulse rounded bg-sand/60" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-sand/60" />
            <div className="h-3.5 w-full animate-pulse rounded bg-sand/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JoinedEventsCardHolder() {
  const { user, isPending } = useSessionContext();

  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  // Which participant the request state in memory belongs to. Without this a
  // previous account's events or error could flash for one render after
  // switching users.
  const [settledParticipantId, setSettledParticipantId] = useState<
    string | undefined
  >(undefined);

  const participantId = user?.id;
  const isSettledForCurrentUser = settledParticipantId === participantId;

  useEffect(() => {
    // The session has not resolved yet, so there is nobody to fetch for.
    if (isPending) return;

    const controller = new AbortController();

    // Signed out: nothing to fetch. The signed-out UI is rendered below, and
    // this render guard also keeps a previous user's events off screen.
    if (!participantId) return;

    async function loadEvents() {
      setStatus("loading");
      setErrorMessage("");

      if (!API_URL) {
        setSettledParticipantId(participantId);
        setStatus("error");
        setErrorMessage(
          "NEXT_PUBLIC_API_URL is not configured. Restart the dev server after updating .env.",
        );
        return;
      }

      try {
        const token = await getClientJwtToken();
        const response = await fetch(
          `${API_URL}/joinedEvent/list/${participantId}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `The server responded with ${response.status} ${response.statusText}.`,
          );
        }

        const data: unknown = await response.json();

        if (controller.signal.aborted) return;

        const list: ApiEvent[] = Array.isArray(data) ? data : [];

        setEvents(list);
        setSettledParticipantId(participantId);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Failed to load joined events", error);
        setSettledParticipantId(participantId);
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
  }, [isPending, participantId, reloadToken]);

  // The first session request is still in flight: show skeletons, not a
  // misleading "log in" prompt.
  if (isPending) {
    return <EventsSkeleton />;
  }

  if (!user) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8cfb9] bg-[#fffdf7] px-6 py-14 text-center">
        <i
          aria-hidden="true"
          className="fa-solid fa-user-lock text-3xl text-forest/40"
        />
        <p className="mt-3 font-serif text-xl font-bold text-forest">
          Log in to see your joined events
        </p>
        <p className="mt-1 max-w-md text-sm font-medium text-forest/65">
          Events you join will appear here once you are signed in.
        </p>
        <Link
          href="/log-in"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-clay px-5 py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-colors hover:bg-[#c24714] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf7]"
        >
          <i
            aria-hidden="true"
            className="fa-solid fa-arrow-right-to-bracket"
          />
          Log In
        </Link>
      </div>
    );
  }

  if (status === "error" && isSettledForCurrentUser) {
    return (
      <div
        role="alert"
        className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-2.5">
          <i
            aria-hidden="true"
            className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-bold">
              Couldn&apos;t load joined events
            </p>
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
    );
  }

  // Also covers the render right after the session resolves, before the
  // effect for this participant has finished loading.
  if (status === "loading" || !isSettledForCurrentUser) {
    return <EventsSkeleton />;
  }

  if (events.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8cfb9] bg-[#fffdf7] px-6 py-14 text-center">
        <i
          aria-hidden="true"
          className="fa-regular fa-calendar-xmark text-3xl text-forest/40"
        />
        <p className="mt-3 font-serif text-xl font-bold text-forest">
          No joined events yet
        </p>
        <p className="mt-1 max-w-md text-sm font-medium text-forest/65">
          Events you join will appear here once you sign up for them.
        </p>
        <Link
          href="/events"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-clay px-5 py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-colors hover:bg-[#c24714] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf7]"
        >
          <i aria-hidden="true" className="fa-solid fa-calendar-days" />
          Browse events
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <JoinedEventCard key={eventKey(event, index)} event={event} />
      ))}
    </div>
  );
}
