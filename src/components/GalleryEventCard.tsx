import Image from "next/image";

export type EventCategory = "Cleanup" | "Plantation" | "Donation" | "Awareness";

export type Event = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  location: string;
  image: string;
  imageAlt: string;
};

const CATEGORY_ICONS: Record<EventCategory, string> = {
  Cleanup: "fa-trash-can",
  Plantation: "fa-leaf",
  Donation: "fa-heart",
  Awareness: "fa-bullhorn",
};

const CATEGORY_ICON_COLORS: Record<EventCategory, string> = {
  Cleanup: "text-[#f59a4a]",
  Plantation: "text-[#a9d488]",
  Donation: "text-[#f59a4a]",
  Awareness: "text-[#f59a4a]",
};

export default function GalleryEventCard({ event }: { event: Event }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-forest/10 shadow-[0_20px_45px_-32px_rgba(17,54,34,0.6)]">
      <div className="relative aspect-video">
        <Image
          src={event.image}
          alt={event.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="flex items-start gap-2 text-[15.5px] font-bold text-white sm:text-[16.5px]">
            <i
              aria-hidden="true"
              className={`fa-solid ${CATEGORY_ICONS[event.category]} ${
                CATEGORY_ICON_COLORS[event.category]
              } mt-0.5 shrink-0 text-[0.95em]`}
            />
            <span>{event.title}</span>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-medium text-white/85">
            <span className="flex items-center gap-1.5">
              <i aria-hidden="true" className="fa-regular fa-calendar" />
              {event.date}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-white/35 sm:block"
            />
            <span className="flex items-center gap-1.5">
              <i aria-hidden="true" className="fa-solid fa-location-dot" />
              {event.location}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
