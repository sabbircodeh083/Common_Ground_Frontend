"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

type FormErrors = {
  name?: string;
  email?: string;
  image?: string;
  password?: string;
  form?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = [
    {
      label: "At least 6 characters",
      met: password.length >= 6,
    },
    {
      label: "One uppercase letter (A – Z)",
      met: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter (a – z)",
      met: /[a-z]/.test(password),
    },
  ];

  function clearError(field: keyof FormErrors) {
    setErrors((current) => {
      if (!current[field] && !current.form) return current;
      return { ...current, [field]: undefined, form: undefined };
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedImage = image.trim();

    if (!trimmedName) {
      nextErrors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "Full name must be at least 2 characters.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (trimmedImage && !isValidHttpUrl(trimmedImage)) {
      nextErrors.image =
        "Enter a valid image URL starting with http:// or https://.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password)
    ) {
      nextErrors.password = "Password must meet all the requirements below.";
    }

    if (
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.image ||
      nextErrors.password
    ) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
        ...(trimmedImage ? { image: trimmedImage } : {}),
      });

      if (error) {
        setErrors({
          form: error.message ?? "Unable to create your account.",
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

  return (
    <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#f4efe0] px-4 py-10 font-sans sm:min-h-[calc(100vh-5.5rem)] lg:min-h-[calc(100vh-3.75rem)]">
      <div className="w-full max-w-115 rounded-4xl bg-[#fcfaf3] p-6 shadow-[0_28px_70px_-40px_rgba(43,66,37,0.45)] ring-1 ring-[#dcd5c3] sm:p-9">
        <div className="text-center">
          <h1 className="font-serif text-[2rem] font-black tracking-tight text-forest sm:text-[2.35rem]">
            Create Your <span className="text-clay">Account</span>
          </h1>
          <p className="mt-3 text-sm font-medium text-forest/70 sm:text-base">
            Join CommonGround and start making an impact today.
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
              htmlFor="name"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-forest"
            >
              <i
                aria-hidden="true"
                className="fa-solid fa-user text-[0.95rem]"
              />
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError("name");
              }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="Enter your full name"
              className={`h-12 w-full rounded-xl border bg-[#fcfaf3] px-4 text-[15px] text-forest outline-none transition placeholder:text-forest/40 focus:ring-2 ${
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                  : "border-[#d8d1be] focus:border-forest focus:ring-forest/15"
              }`}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.name}
              </p>
            )}
          </div>

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
              htmlFor="image"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-forest"
            >
              <i
                aria-hidden="true"
                className="fa-solid fa-link text-[0.95rem]"
              />
              Profile Photo URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              autoComplete="url"
              value={image}
              onChange={(event) => {
                setImage(event.target.value);
                clearError("image");
              }}
              aria-invalid={Boolean(errors.image)}
              aria-describedby={errors.image ? "image-error" : undefined}
              placeholder="https://example.com/photo.jpg"
              className={`h-12 w-full rounded-xl border bg-[#fcfaf3] px-4 text-[15px] text-forest outline-none transition placeholder:text-forest/40 focus:ring-2 ${
                errors.image
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                  : "border-[#d8d1be] focus:border-forest focus:ring-forest/15"
              }`}
            />
            {errors.image && (
              <p
                id="image-error"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.image}
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
                autoComplete="new-password"
                required
                minLength={6}
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

          <div className="rounded-2xl border border-[#d7e2c1] bg-[#e9f0da] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-forest">
              <i aria-hidden="true" className="fa-solid fa-lock" />
              Your password must have:
            </p>
            <ul className="mt-3 space-y-2">
              {passwordChecks.map((check) => (
                <li
                  key={check.label}
                  className="flex items-center gap-2 text-sm font-medium text-forest/80"
                >
                  <i
                    aria-hidden="true"
                    className={`fa-solid ${
                      check.met
                        ? "fa-circle-check text-forest"
                        : "fa-circle text-forest/35"
                    }`}
                  />
                  {check.label}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-forest px-6 text-base font-semibold text-cream shadow-sm transition-colors hover:bg-[#0a3f28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf3] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <i
                  aria-hidden="true"
                  className="fa-solid fa-spinner animate-spin"
                />
                Creating account...
              </>
            ) : (
              <>
                <i aria-hidden="true" className="fa-solid fa-user-plus" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-[#ded6c4] pt-5 text-center text-sm font-medium text-forest">
          Already have an account?{" "}
          <Link
            href="/log-in"
            className="font-bold underline-offset-4 transition-colors hover:text-clay hover:underline"
          >
            Log In
          </Link>
        </div>
      </div>
    </section>
  );
}
