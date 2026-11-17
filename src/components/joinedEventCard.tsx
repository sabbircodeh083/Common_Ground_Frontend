import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

export type EventData = {
  _id: string;
  title: string;
  type: string;
  date: string;
  description: string;
  thumbnailUrl: string;
  location: string;
  numberOfVolunteers: number;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerImage: string | null | undefined;
};

type EventCardProps = {
  event: EventData;
};

const categoryIcons: Record<string, string> = {
  cleanup: "fa-broom",
  plantation: "fa-seedling",
  donation: "fa-hand-holding-heart",
  awareness: "fa-bullhorn",
};

function formatEventDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(new Date(year, month - 1, day));
}

export default function JoinedEventCard({ event }: EventCardProps) {
  const category = event.type.toLowerCase();
  const categoryIcon = categoryIcons[category] || "fa-leaf";

  const handleLeaveEvent = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${event._id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        toast.error("Unsucessfull evetn Deletion");
      } else {
        toast.success("Sucessfull evetn Deletion");
        window.location.reload();
      }
    } catch (err) {
      console.log("error for event deletion", err);
      toast.error("Unsucessfull evetn Deletion");
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#DDDCCB] bg-[#FFFEF8] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Event Image */}
      <div className="relative aspect-2/1 w-full overflow-hidden">
        <Image
          src={event.thumbnailUrl}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-[#F7F5E8]/95 px-4 py-2 text-sm font-semibold text-[#164E36] shadow-sm backdrop-blur-sm">
          <i className={`fa-solid ${categoryIcon}`} aria-hidden="true" />
          <span className="capitalize">{event.type}</span>
        </div>

        {/* Date Badge */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-[#F7F5E8]/95 px-4 py-2 text-sm font-semibold text-[#173D2C] shadow-sm backdrop-blur-sm">
          <i className="fa-regular fa-calendar-days" aria-hidden="true" />
          {formatEventDate(event.date)}
        </div>
      </div>

      {/* Event Information */}
      <div className="space-y-3 p-5">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-[#59635C]">
          <i
            className="fa-solid fa-location-dot shrink-0 text-[#164E36]"
            aria-hidden="true"
          />
          <span>{event.location}</span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 font-serif text-xl font-bold text-[#123D2B]">
          {event.title}
        </h3>

        {/* View details */}
        <div className="flex flex-row justify-between items-center">
          <Link
            className="text-blue-400 hover:text-blue-500 flex flex-row gap-1.5 items-center"
            href={`/events/${event._id}`}
          >
            <p>View Details</p>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>

          <button
            type="button"
            onClick={handleLeaveEvent}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            Leave Event
          </button>
        </div>
      </div>
    </article>
  );
}
