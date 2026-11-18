"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventData } from "@/components/EventCard";
import { useSessionContext } from "@/components/SessionProvider";
import ManageEventCard from "./ManageEventCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiEvent = EventData & { _id?: string };

type LoadStatus = "loading" | "success" | "error";

const SKELETON_COUNT = 6;

function eventKey(event: ApiEvent, index: number) {
  return event._id ?? `${event.title}-${event.date}-${index}`;
}

export default function ManageEventsCardHolder() {
  const { user, isPending } = useSessionContext();

  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const participantId = user?.id;

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
        const response = await fetch(
          `${API_URL}/organizedEvent/list/${participantId}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `The server responded with ${response.status} ${response.statusText}.`,
          );
        }

        const data: unknown = await response.json();
        const list: ApiEvent[] = Array.isArray(data) ? data : [];

        setEvents(list);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Failed to load events", error);
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

  if (!isPending && !user) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8cfb9] bg-[#fffdf7] px-6 py-14 text-center">
        <i
          aria-hidden="true"
          className="fa-solid fa-user-lock text-3xl text-forest/40"
        />
        <p className="mt-3 font-serif text-xl font-bold text-forest">
          Log in to see your organized events
        </p>
        <p className="mt-1 max-w-md text-sm font-medium text-forest/65">
          Events you organized will appear here once you are signed in.
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

  if (status === "error") {
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
            <p className="text-sm font-bold">Couldn&apos;t load events</p>
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

  if (status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <span className="sr-only">Loading events…</span>
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

  if (events.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8cfb9] bg-[#fffdf7] px-6 py-14 text-center">
        <i
          aria-hidden="true"
          className="fa-regular fa-calendar-xmark text-3xl text-forest/40"
        />
        <p className="mt-3 font-serif text-xl font-bold text-forest">
          No organized events yet
        </p>
        <p className="mt-1 max-w-md text-sm font-medium text-forest/65">
          New community events will appear here as soon as you Organized a
          event.
        </p>
        <Link
          href="/events/create"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-clay px-5 py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-colors hover:bg-[#c24714] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf7]"
        >
          <i aria-hidden="true" className="fa-solid fa-plus" />
          Create an event
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <ManageEventCard key={eventKey(event, index)} event={event} />
      ))}
    </div>
  );
}
