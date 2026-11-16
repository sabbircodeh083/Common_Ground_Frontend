const features = [
  { label: "Upcoming Events", icon: "fa-regular fa-calendar" },
  { label: "Volunteer Opportunities", icon: "fa-solid fa-people-group" },
  { label: "Community Initiatives", icon: "fa-solid fa-leaf" },
  { label: "Platform Updates", icon: "fa-solid fa-bullhorn" },
];

export default function Newsletter() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="bg-[#fbf1e4] px-4 pb-16 font-sans sm:px-8 sm:pb-20 lg:px-14"
    >
      <div className="mx-auto max-w-[1720px]">
        <div className="mx-auto max-w-190 text-center">
          <span className="inline-flex items-center rounded-full bg-[#e8f1d8] px-4 py-1.5 text-[13px] font-semibold text-[#3f7d34]">
            Newsletter
          </span>

          <h2
            id="newsletter-heading"
            className="mx-auto mt-4 max-w-160 font-serif text-[2rem] font-black leading-[1.12] tracking-tight text-forest sm:text-[2.6rem] lg:text-[3rem]"
          >
            Stay Connected with Our Community
          </h2>

          <p className="mx-auto mt-4 max-w-140 text-[14.5px] leading-6 font-medium text-forest/70 sm:text-base sm:leading-7">
            Subscribe to our newsletter and never miss an opportunity to make a
            difference.
          </p>

          <div className="mx-auto mt-7 flex w-full max-w-160 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-13 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#e2dcca] bg-white px-4 shadow-[0_10px_30px_-24px_rgba(17,54,34,0.5)]">
              <i
                aria-hidden="true"
                className="fa-regular fa-envelope shrink-0 text-[15px] text-forest/55"
              />
              <input
                type="email"
                name="newsletter-email"
                autoComplete="email"
                aria-label="Email address"
                placeholder="Enter your email address"
                className="h-full w-full min-w-0 bg-transparent text-sm text-forest outline-none placeholder:text-forest/45"
              />
            </div>

            <button
              type="button"
              className="flex h-13 shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#4f9f42] px-7 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[#3f7d34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f7d34]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf1e4]"
            >
              Subscribe
              <i
                aria-hidden="true"
                className="fa-solid fa-arrow-right text-[13px]"
              />
            </button>
          </div>
        </div>

        <ul className="mx-auto mt-12 grid max-w-220 grid-cols-2 gap-y-9 sm:mt-14 sm:grid-cols-4 sm:gap-y-0">
          {features.map((feature, index) => (
            <li
              key={feature.label}
              className={`flex flex-col items-center gap-3 text-center ${
                index > 0 ? "sm:border-l sm:border-[#e4ddca]" : ""
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f2d5] text-[#3f7d34]">
                <i
                  aria-hidden="true"
                  className={`${feature.icon} text-[1.05rem]`}
                />
              </span>
              <span className="max-w-38 text-[13.5px] font-semibold leading-5 text-forest sm:text-[14px]">
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
