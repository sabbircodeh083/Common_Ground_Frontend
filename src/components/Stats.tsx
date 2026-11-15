const stats = [
  {
    value: "1,450+",
    label: "Active Volunteers",
    icon: "fa-people-group",
    tint: "text-clay",
  },
  {
    value: "180+",
    label: "Events Completed",
    icon: "fa-calendar-days",
    tint: "text-clay",
  },
  {
    value: "24,000+",
    label: "Lives Impacted",
    icon: "fa-hand-holding-heart",
    tint: "text-clay",
  },
  {
    value: "100%",
    label: "Community Driven",
    icon: "fa-leaf",
    tint: "text-[#3f7d34]",
  },
];

export default function Stats() {
  return (
    <section className="bg-[#fbf1e4] px-4 pb-12 font-sans sm:px-8 sm:pb-14 lg:px-14">
      <dl className="mx-auto grid max-w-[1720px] grid-cols-2 gap-y-7 rounded-[1.5rem] bg-[#fbf6e9] px-5 py-7 ring-1 ring-[#e7ddc8] sm:gap-y-8 sm:px-8 sm:py-8 lg:grid-cols-4 lg:gap-y-0 lg:px-4 lg:py-9">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={[
              "flex min-w-0 items-center gap-3 sm:gap-4",
              index % 2 === 1 ? "border-l border-[#e3d8c0] pl-4 sm:pl-6" : "",
              index > 0 ? "lg:border-l lg:border-[#e3d8c0] lg:pl-8" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <i
              aria-hidden="true"
              className={`fa-solid ${stat.icon} shrink-0 text-[1.7rem] sm:text-[2rem] ${stat.tint}`}
            />

            <div className="min-w-0">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-[1.35rem] font-extrabold leading-tight tracking-tight text-forest sm:text-[1.6rem]">
                {stat.value}
              </dd>
              <dd className="mt-0.5 text-[12.5px] font-medium text-forest/65 sm:text-[13.5px]">
                {stat.label}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
