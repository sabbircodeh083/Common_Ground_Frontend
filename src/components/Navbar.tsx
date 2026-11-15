"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  { label: "Create Event", href: "/events/create", icon: "fa-calendar-plus" },
  { label: "Manage Events", href: "/events/manage", icon: "fa-calendar-days" },
  { label: "Joined Events", href: "/events/joined", icon: "fa-user-group" },
] as const;

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      setIsMenuOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40">
      <nav
        aria-label="Primary"
        className="mx-auto grid h-20 w-full max-w-[1720px] grid-cols-[1fr_auto_1fr] items-center gap-2 border border-white/60 bg-cream px-4 font-sans shadow-[0_18px_40px_-32px_rgba(17,54,34,0.45)] sm:h-15 sm:gap-4 sm:px-6 lg:h-20 lg:px-3"
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 justify-self-start"
        >
          <Image
            src="/logo.png"
            alt=""
            width={56}
            height={56}
            priority
            className="h-11 w-11 shrink-0 object-contain sm:h-13 sm:w-13 lg:h-14 lg:w-14"
          />
          <span className="hidden truncate font-serif text-[1.7rem] font-black tracking-tight text-forest lg:block lg:text-[2rem]">
            CommonGround
          </span>
        </Link>

        <Link
          href="/events"
          className="justify-self-center whitespace-nowrap text-[0.95rem] font-bold text-forest transition-colors hover:text-forest/70 sm:text-base lg:text-[1.15rem]"
        >
          Upcoming Events
        </Link>

        <div className="flex items-center justify-self-end">
          {isPending ? (
            <div
              aria-hidden="true"
              className="h-11 w-11 animate-pulse rounded-full bg-sand/70 sm:h-13 sm:w-13"
            />
          ) : user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label={
                  isMenuOpen ? "Close account menu" : "Open account menu"
                }
                className="group relative flex items-center gap-2 rounded-full p-1 outline-none transition focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <ProfileAvatar
                  user={user}
                  className="h-11 w-11 border-2 border-[#e3ead4] sm:h-13 sm:w-13 lg:h-14 lg:w-14"
                />
                <i
                  aria-hidden="true"
                  className={`fa-solid fa-chevron-down text-base text-forest transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />

                <span className="pointer-events-none absolute -top-10 right-6 whitespace-nowrap rounded-lg bg-forest px-4 py-1.5 text-sm font-semibold text-cream opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {user.name}
                  <span className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-forest" />
                </span>
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-3 max-h-[calc(100vh-6rem)] w-[calc(100vw-2rem)] max-w-95 overflow-y-auto rounded-3xl bg-cream p-4 shadow-[0_24px_60px_-24px_rgba(17,54,34,0.4)] ring-1 ring-forest/10 sm:mt-4 sm:rounded-[1.75rem] sm:p-5"
                >
                  <div className="flex items-center gap-4">
                    <ProfileAvatar
                      user={user}
                      className="h-11 w-11 sm:h-12 sm:w-12"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-forest">
                        {user.name}
                      </p>
                      <p className="truncate text-sm text-forest/60">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="my-4 border-t border-sand" />

                  <div className="space-y-1">
                    {menuItems.map(({ label, href, icon }) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-[15px] font-medium text-forest transition-colors hover:bg-[#f1edde]"
                      >
                        <i
                          aria-hidden="true"
                          className={`fa-solid ${icon} shrink-0 text-[1.15rem]`}
                        />
                        {label}
                      </Link>
                    ))}
                  </div>

                  <div className="my-3 border-t border-sand" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-[15px] font-semibold text-clay transition-colors hover:bg-[#f8e6dc] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i
                      aria-hidden="true"
                      className="fa-solid fa-arrow-right-from-bracket shrink-0 text-[1.15rem]"
                    />
                    {isSigningOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/log-in"
              className="rounded-2xl border border-sand bg-[#fdfbf2] px-5 py-3 text-sm font-semibold text-forest shadow-sm transition-colors hover:bg-white sm:px-4 sm:py-1 sm:text-base"
            >
              Log In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function ProfileAvatar({
  user,
  className = "",
}: {
  user: { name?: string | null; image?: string | null };
  className?: string;
}) {
  const nameParts = (user.name ?? "").trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length
    ? `${nameParts[0][0]}${
        nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : ""
      }`.toUpperCase()
    : "?";

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest text-sm font-bold text-cream ${className}`}
    >
      <span aria-hidden="true">{initials}</span>
      {user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt=""
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  );
}
