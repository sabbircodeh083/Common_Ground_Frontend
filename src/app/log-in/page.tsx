"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

export default function LogInPage() {
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#f4efe0] px-4 py-10 font-sans sm:min-h-[calc(100vh-5.5rem)] lg:min-h-[calc(100vh-3.75rem)]">
      <div className="w-full max-w-115 rounded-4xl bg-[#fcfaf3] p-6 shadow-[0_28px_70px_-40px_rgba(43,66,37,0.45)] ring-1 ring-[#dcd5c3] sm:p-9">
        <div className="text-center">
          <h1 className="font-serif text-[2rem] font-black tracking-tight text-forest sm:text-[2.35rem]">
            Log In to Your <span className="text-clay">Account</span>
          </h1>
          <p className="mt-3 text-sm font-medium text-forest/70 sm:text-base">
            Continue your journey with CommonGround.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-forest"
            >
              <i
                aria-hidden="true"
                className="fa-solid fa-envelope text-[0.95rem]"
              />
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email address"
              className="h-12 w-full rounded-xl border border-[#d8d1be] bg-[#fcfaf3] px-4 text-[15px] text-forest outline-none transition placeholder:text-forest/40 focus:border-forest focus:ring-2 focus:ring-forest/15"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-forest"
            >
              <i
                aria-hidden="true"
                className="fa-solid fa-lock text-[0.95rem]"
              />
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-[#d8d1be] bg-[#fcfaf3] px-4 pr-12 text-[15px] text-forest outline-none transition placeholder:text-forest/40 focus:border-forest focus:ring-2 focus:ring-forest/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-forest/80 transition-colors hover:text-forest"
              >
                <i
                  aria-hidden="true"
                  className={`fa-solid ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-forest px-6 text-base font-semibold text-cream shadow-sm transition-colors hover:bg-[#0a3f28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf3]"
          >
            <i
              aria-hidden="true"
              className="fa-solid fa-arrow-right-to-bracket"
            />
            Log In
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#ded6c4]" />
          <span className="text-sm font-medium text-forest/65">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-[#ded6c4]" />
        </div>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#d8d1be] bg-white px-6 text-base font-semibold text-forest shadow-sm transition-colors hover:bg-[#fbf7ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          <i
            aria-hidden="true"
            className="fa-brands fa-google text-[1.1rem] text-[#4285f4]"
          />
          Continue with Google
        </button>

        <div className="mt-7 border-t border-[#ded6c4] pt-5 text-center text-sm font-medium text-forest">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-bold underline-offset-4 transition-colors hover:text-clay hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </section>
  );
}
