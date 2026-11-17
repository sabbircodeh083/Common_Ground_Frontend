"use client";

import { useState } from "react";
import GalleryEventCard from "@/components/GalleryEventCard";
import type { EventCategory, Event } from "@/components/GalleryEventCard";

const GALLERY_EVENTS: Event[] = [
  {
    id: "campus-clean-up",
    title: "Campus Clean-Up Drive",
    category: "Cleanup",
    date: "Nov 22, 2026",
    location: "AIUB Campus",
    image: "/Gallery_section_Image/Cleanup2.jpeg",
    imageAlt:
      "Volunteers collecting waste in black bags during a campus clean-up",
  },
  {
    id: "tree-plantation",
    title: "Tree Plantation Campaign",
    category: "Plantation",
    date: "Oct 10, 2026",
    location: "National Park, Dhaka",
    image: "/Gallery_section_Image/Plantation3.jpg",
    imageAlt: "Children and volunteers planting a sapling together",
  },
  {
    id: "winter-donation",
    title: "Winter Donation Drive",
    category: "Donation",
    date: "Jan 15, 2026",
    location: "Mirpur, Dhaka",
    image: "/Gallery_section_Image/Donation3.jpeg",
    imageAlt: "Relief supplies and donations distributed to families",
  },
  {
    id: "awareness-session",
    title: "Environmental Awareness Session",
    category: "Awareness",
    date: "Sep 18, 2026",
    location: "Local School, Dhaka",
    image: "/Gallery_section_Image/Awarness1.jpeg",
    imageAlt:
      "Volunteer leading an environmental awareness session at a school",
  },
  {
    id: "river-clean-up",
    title: "River Clean-Up Initiative",
    category: "Cleanup",
    date: "Aug 30, 2026",
    location: "Buriganga River",
    image: "/Gallery_section_Image/Cleanup3.webp",
    imageAlt: "Community members sweeping and clearing litter from a roadside",
  },
  {
    id: "clothing-donation",
    title: "Clothing Donation Program",
    category: "Donation",
    date: "Jul 12, 2026",
    location: "Uttara, Dhaka",
    image: "/Gallery_section_Image/Donation5.jpg",
    imageAlt: "Volunteers handing over a donation box to a community member",
  },
];

type FilterValue = "All Events" | EventCategory;

const FILTERS: { label: FilterValue; icon?: string }[] = [
  { label: "All Events" },
  { label: "Cleanup", icon: "fa-calendar-days" },
  { label: "Plantation", icon: "fa-leaf" },
  { label: "Donation", icon: "fa-heart" },
  { label: "Awareness", icon: "fa-bullhorn" },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All Events");

  const visibleEvents =
    activeFilter === "All Events"
      ? GALLERY_EVENTS
      : GALLERY_EVENTS.filter((event) => event.category === activeFilter);

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="bg-[#fbf1e4] px-4 pb-14 font-sans sm:px-8 sm:pb-16 lg:px-14"
    >
      <div className="mx-auto max-w-[1720px]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <span
              aria-hidden="true"
              className="hidden h-0.75 w-14 rounded-full bg-clay sm:block"
            />
            <h2
              id="gallery-heading"
              className="flex items-center gap-3 font-serif text-[2rem] font-black tracking-tight text-forest sm:text-[2.5rem]"
            >
              <i
                aria-hidden="true"
                className="fa-regular fa-image text-[0.78em]"
              />
              Gallery
            </h2>
            <span
              aria-hidden="true"
              className="hidden h-0.75 w-14 rounded-full bg-clay sm:block"
            />
          </div>

          <p className="mx-auto mt-4 max-w-184 text-[14.5px] leading-6 font-medium text-forest/75 sm:text-base sm:leading-7">
            Snapshots from our community service events, showing the power of
            people coming together for a cleaner, greener, and kinder world.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter gallery by event type"
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:mt-8 sm:gap-3"
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.label;

            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => setActiveFilter(filter.label)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf1e4] sm:px-5 sm:text-[14.5px] ${
                  isActive
                    ? "border-forest bg-forest text-cream shadow-sm"
                    : "border-[#c9d3b6] bg-transparent text-forest hover:border-forest/45 hover:bg-[#f1f6e6]"
                }`}
              >
                {filter.icon && (
                  <i
                    aria-hidden="true"
                    className={`fa-solid ${filter.icon} text-[0.9em]`}
                  />
                )}
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:mt-9 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <GalleryEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
