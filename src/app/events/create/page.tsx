import Link from "next/link";
import CreateEventForm from "@/components/CreateEventForm";

export default function CreateEventPage() {
  return (
    <section className="bg-[#fbf1e4] px-4 py-7 font-sans sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto w-full max-w-160">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-forest transition-colors hover:text-clay"
        >
          <i
            aria-hidden="true"
            className="fa-solid fa-chevron-left text-[11px]"
          />
          Back
        </Link>

        <h1 className="mt-3 font-serif text-[1.9rem] font-black tracking-tight text-forest sm:text-[2.15rem]">
          Create New Event
        </h1>
        <p className="mt-1.5 text-[13.5px] font-medium text-forest/70 sm:text-[14.5px]">
          Organize a community initiative and invite others to make a positive
          impact.
        </p>

        <CreateEventForm />
      </div>
    </section>
  );
}
