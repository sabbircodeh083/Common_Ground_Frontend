"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LogInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOauthLoading, setIsOauthLoading] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((current) => {
      if (!current[field] && !current.form) return current;
      return { ...current, [field]: undefined, form: undefined };
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setErrors({
          form: error.message ?? "Unable to log in. Please try again.",
        });
        return;
      }

      router.push("/");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOauthLogin() {
    setErrors({});
    setIsOauthLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        setErrors({
          form: error.message ?? "Unable to continue with Google.",
        });
        setIsOauthLoading(false);
      }
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
      setIsOauthLoading(false);
    }
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

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          {errors.form && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <i
                aria-hidden="true"
                className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"
              />
              <span>{errors.form}</span>
            </div>
          )}

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
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="Enter your email address"
              className={`h-12 w-full rounded-xl border bg-[#fcfaf3] px-4 text-[15px] text-forest outline-none transition placeholder:text-forest/40 focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                  : "border-[#d8d1be] focus:border-forest focus:ring-forest/15"
              }`}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.email}
              </p>
            )}
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
                minLength={8}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError("password");
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                placeholder="Enter your password"
                className={`h-12 w-full rounded-xl border bg-[#fcfaf3] px-4 pr-12 text-[15px] text-forest outline-none transition placeholder:text-forest/40 focus:ring-2 ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                    : "border-[#d8d1be] focus:border-forest focus:ring-forest/15"
                }`}
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
            {errors.password && (
              <p
                id="password-error"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isOauthLoading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-forest px-6 text-base font-semibold text-cream shadow-sm transition-colors hover:bg-[#0a3f28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf3] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <i
                  aria-hidden="true"
                  className="fa-solid fa-spinner animate-spin"
                />
                Logging in...
              </>
            ) : (
              <>
                <i
                  aria-hidden="true"
                  className="fa-solid fa-arrow-right-to-bracket"
                />
                Log In
              </>
            )}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-sand" />
          <span className="text-sm font-medium text-forest/65">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-sand" />
        </div>

        <button
          type="button"
          onClick={handleOauthLogin}
          disabled={isOauthLoading || isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#d8d1be] bg-white px-6 text-base font-semibold text-forest shadow-sm transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isOauthLoading ? (
            <>
              <i
                aria-hidden="true"
                className="fa-solid fa-spinner animate-spin"
              />
              Redirecting...
            </>
          ) : (
            <>
              <i
                aria-hidden="true"
                className="fa-brands fa-google text-[1.1rem] text-[#4285f4]"
              />
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-7 border-t border-sand pt-5 text-center text-sm font-medium text-forest">
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
