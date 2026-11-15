import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="bg-[#fbf1e4] font-sans">
      <div className="mx-auto grid max-w-[1720px] items-center gap-8 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-14 lg:py-16">
        <div className="max-w-[34rem]">
          <h1 className="font-serif text-[2.25rem] font-black leading-[0.95] tracking-tight text-forest sm:text-[3.5rem] lg:text-[4.25rem] xl:text-[4.8rem]">
            <span className="block">Small acts.</span>
            <span className="block">Stronger</span>
            <span className="relative inline-block pb-2 text-clay">
              neighbourhoods.
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-[5px] w-full -rotate-1 rounded-full bg-clay"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-3 left-3 h-[3px] w-[88%] rotate-1 rounded-full bg-clay/70"
              />
            </span>
          </h1>

          <p className="mt-6 max-w-[31rem] text-[15px] leading-6 text-forest/80 sm:text-base sm:leading-7">
            A community platform to discover, join, and create local events that
            make a real difference &mdash; from relief and donation drives to
            cleanups, tree planting, health camps, and education initiatives.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className="flex items-center gap-2 rounded-lg bg-forest px-6 py-3.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-[#0a3f28]"
            >
              Explore events
              <i aria-hidden="true" className="fa-solid fa-arrow-right" />
            </Link>

            <Link
              href="/events/create"
              className="flex items-center gap-2 rounded-lg border border-[#9cae7d] bg-transparent px-6 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-white/40"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-forest/40">
                <i aria-hidden="true" className="fa-solid fa-plus text-[10px]" />
              </span>
              Create an event
            </Link>
          </div>
        </div>

        <div className="w-full">
          <Image
            src="/benner.png"
            alt="Community members planting trees, distributing blankets, and cleaning a riverbank"
            width={1441}
            height={1092}
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
