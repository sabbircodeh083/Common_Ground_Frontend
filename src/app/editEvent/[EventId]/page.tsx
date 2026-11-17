import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import EditEventForm from "@/components/EditEventForm";

export const metadata: Metadata = {
  title: "Edit Event | CommonGround",
  description: "Update the details of a community event you organize.",
};

function EditEventFormSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mt-6 space-y-5 rounded-2xl bg-[#fffdf7] p-5 ring-1 ring-[#e7ddc8] sm:p-7"
    >
      <span className="sr-only">Loading event…</span>
      <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
      </div>
      <div className="h-32 w-full animate-pulse rounded-lg bg-sand/40" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
    </div>
  );
}

export default function EditEventPage() {
  return (
    <section className="bg-[#fbf1e4] px-4 py-7 font-sans sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto w-full max-w-[640px]">
        <Link
          href="/manageEvents"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-forest transition-colors hover:text-clay"
        >
          <i aria-hidden="true" className="fa-solid fa-chevron-left text-[11px]" />
          Back
        </Link>

        <h1 className="mt-3 font-serif text-[1.9rem] font-black tracking-tight text-forest sm:text-[2.15rem]">
          Edit Event
        </h1>
        <p className="mt-1.5 text-[13.5px] font-medium text-forest/70 sm:text-[14.5px]">
          Update the details below and save your changes.
        </p>

        <Suspense fallback={<EditEventFormSkeleton />}>
          <EditEventForm />
        </Suspense>
      </div>
    </section>
  );
}
