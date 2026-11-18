"use client";

const STORAGE_KEY = "cg-theme";

/**
 * Sun / moon switch for the light and dark themes.
 *
 * The visible icon is chosen in CSS (see `.theme-toggle-icon` in globals.css)
 * rather than React state, so the server and client markup always match. It has
 * to live on a wrapper because Font Awesome sets `display` on `.fa-solid`.
 */
export default function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const isDark = !root.classList.contains("dark");

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";

    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Storage can be blocked (private mode); the toggle still works per page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
      className="theme-toggle flex h-11 w-11 items-center justify-center rounded-full border border-sand bg-[#fdfbf2] text-forest shadow-sm transition-colors hover:bg-[#eef4e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:h-12 sm:w-12"
    >
      {/* Light theme shows the moon (switch to dark); dark theme shows the sun. */}
      <span
        aria-hidden="true"
        className="theme-toggle-icon theme-toggle-icon--moon"
      >
        <i className="fa-solid fa-moon text-[1.05rem]" />
      </span>
      <span
        aria-hidden="true"
        className="theme-toggle-icon theme-toggle-icon--sun"
      >
        <i className="fa-solid fa-sun text-[1.05rem]" />
      </span>
    </button>
  );
}
