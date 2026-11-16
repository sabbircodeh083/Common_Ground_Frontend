"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const socialLinks = [
  { label: "YouTube", href: "https://www.youtube.com", icon: "fa-youtube" },
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: "fa-facebook-f",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: "fa-instagram",
  },
  { label: "GitHub", href: "https://github.com", icon: "fa-github" },
];

const platformLinks = [
  { label: "Upcoming Events", href: "/events", icon: "fa-calendar-plus" },
];

const userLinks = [
  { label: "Create Event", href: "/events/create", icon: "fa-calendar-plus" },
  { label: "Manage Events", href: "/events/manage", icon: "fa-calendar-days" },
  { label: "Joined Events", href: "/events/joined", icon: "fa-user-group" },
];

const supportLinks = [
  { label: "Help & FAQ", href: "/help", icon: "fa-circle-question" },
  { label: "Privacy Policy", href: "/privacy", icon: "fa-shield-halved" },
  { label: "Terms & Conditions", href: "/terms", icon: "fa-file-lines" },
];

export default function Footer() {
  return (
    <footer className="">
      <div className="mx-auto max-w-[1720px] overflow-hidden  bg-cream ring-1 ring-[#e2dac8]">
        <div className="grid gap-10 px-6 pt-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.75fr_1.10fr_1.10fr_1.10fr] lg:gap-0 lg:px-14 lg:pt-12">
          <div className="sm:col-span-2 lg:col-span-1 lg:pr-10">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                width={56}
                height={56}
                className="h-12 w-12 shrink-0 object-contain"
              />
              <span className="font-serif text-[1.8rem] font-black tracking-tight text-forest">
                CommonGround
              </span>
            </Link>

            <p className="mt-5 max-w-100 text-[15px] leading-6 text-forest/80">
              A community platform to discover, join, and create local events
              that make a real difference in our neighbourhoods.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8efd8] text-lg text-forest transition-colors hover:bg-[#dce8c8]"
                >
                  <i
                    aria-hidden="true"
                    className={`fa-brands ${social.icon}`}
                  />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Platform" links={platformLinks} />
          <FooterColumn title="For Users" links={userLinks} />
          <FooterColumn title="Support" links={supportLinks} />
        </div>

        <div className="relative h-32 w-full sm:h-40 lg:h-44">
          <Image
            src="/footerIllustration.png"
            alt=""
            fill
            sizes="(max-width: 1720px) 100vw, 1720px"
            className="pointer-events-none select-none object-cover object-[center_58%]"
          />
        </div>

        <div className="px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col items-center justify-between gap-3 border-t border-sand py-5 sm:flex-row">
            <p className="text-sm font-medium text-forest/80">
              © 2026 CommonGround. All rights reserved.
            </p>
            <p className="flex items-center gap-2 text-sm font-bold text-forest">
              <i
                aria-hidden="true"
                className="fa-solid fa-leaf text-[#5e8c3a]"
              />
              <span>
                Small acts.{" "}
                <span className="text-clay">Stronger neighbourhoods.</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-[1.6rem] font-black text-forest">
        {children}
      </h2>
      <span className="mt-2 block h-0.75 w-24 rounded-full bg-clay" />
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; icon: string }[];
}) {
  return (
    <div className="sm:border-t sm:border-[#e3dccb] sm:pt-8 lg:border-l lg:border-t-0 lg:px-8 lg:pt-0 xl:px-10">
      <FooterHeading>{title}</FooterHeading>
      <ul className="mt-5 space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-3 text-[15px] font-medium text-forest/90 transition-colors hover:text-clay"
            >
              <i
                aria-hidden="true"
                className={`fa-solid ${link.icon} w-5 shrink-0 text-center text-[1.15rem] text-forest`}
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
