"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "react-toastify";
import type { EventData } from "@/components/EventCard";
import { useSessionContext } from "@/components/SessionProvider";

const EVENT_TYPES = ["Cleanup", "Plantation", "Donation", "Awareness"];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FormErrors = {
  title?: string;
  eventType?: string;
  date?: string;
  description?: string;
  thumbnailUrl?: string;
  location?: string;
  form?: string;
  numberOfVolunteers?: string;
};

type LoadStatus = "loading" | "success" | "error";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function EditEventForm() {
  const params = useParams<{ EventId: string }>();
  const eventId = params?.EventId;

  const [event, setEvent] = useState<EventData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      setStatus("loading");
      setErrorMessage("");

      if (!API_URL) {
        setStatus("error");
        setErrorMessage(
          "NEXT_PUBLIC_API_URL is not configured. Restart the dev server after updating .env.",
        );
        return;
      }

      if (!eventId) {
        setStatus("error");
        setErrorMessage("This event could not be found.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/events/${encodeURIComponent(eventId)}`,
          { cache: "no-store", signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This event could not be found. It may have been removed."
              : `The server responded with ${response.status} ${response.statusText}.`,
          );
        }

        const data: EventData = await response.json();
        setEvent(data);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Failed to load event", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
      }
    }

    loadEvent();

    return () => controller.abort();
  }, [eventId, reloadToken]);

  if (status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="mt-6 space-y-5 rounded-2xl bg-[#fffdf7] p-5 ring-1 ring-[#e7ddc8] sm:p-7"
      >
        <span className="sr-only">Loading event…</span>
        <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
        </div>
        <div className="h-32 w-full animate-pulse rounded-lg bg-sand/40" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-sand/50" />
      </div>
    );
  }

  if (status === "error" || !event) {
    return (
      <div
        role="alert"
        className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-red-700 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-2.5">
          <i
            aria-hidden="true"
            className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-bold">Couldn&apos;t load this event</p>
            <p className="mt-0.5 text-[13px] font-medium">{errorMessage}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/manageEvents"
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={() => setReloadToken((token) => token + 1)}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <EditEventFormFields event={event} />;
}

function EditEventFormFields({ event }: { event: EventData }) {
  const { user, isPending } = useSessionContext();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(event.title ?? "");
  const [numberOfVolunteers, setNumberOfVolunteers] = useState<number | "">(
    typeof event.numberOfVolunteers === "number"
      ? event.numberOfVolunteers
      : "",
  );
  const [eventType, setEventType] = useState(event.type ?? "");
  const [date, setDate] = useState(event.date ?? "");
  const [description, setDescription] = useState(event.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(event.thumbnailUrl ?? "");
  const [location, setLocation] = useState(event.location ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set the native `min` attribute after mount so the prerendered HTML and the
  // client render agree. The input only accepts dates after today.
  useEffect(() => {
    const input = dateInputRef.current;
    if (!input) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    input.min = toDateInputValue(tomorrow);
  }, []);

  function clearError(field: keyof FormErrors) {
    setErrors((current) => {
      if (!current[field] && !current.form) return current;
      return { ...current, [field]: undefined, form: undefined };
    });
  }

  function syncDescription() {
    const html = editorRef.current?.innerHTML ?? "";
    setDescription(html === "<br>" ? "" : html);
    clearError("description");
  }

  function runEditorCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncDescription();
  }

  function insertLink() {
    const url = window.prompt("Enter the link URL", "https://");
    if (!url) return;
    runEditorCommand("createLink", url);
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    const trimmedThumbnail = thumbnailUrl.trim();
    const plainDescription = stripHtml(description);
    const validVolunteersNumber = numberOfVolunteers;

    if (!validVolunteersNumber) {
      nextErrors.numberOfVolunteers = "Number of volunteers is required";
    } else if (!Number.isInteger(validVolunteersNumber)) {
      nextErrors.numberOfVolunteers = "Number of volunteers must be an integer";
    }

    if (!trimmedTitle) {
      nextErrors.title = "Event title is required.";
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = "Event title must be at least 3 characters.";
    }

    if (!eventType) {
      nextErrors.eventType = "Select an event type.";
    }

    if (!date) {
      nextErrors.date = "Select the event date.";
    } else {
      const selected = new Date(`${date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(selected.getTime())) {
        nextErrors.date = "Select a valid date.";
      } else if (selected.getTime() <= today.getTime()) {
        nextErrors.date = "Event date must be a future date.";
      }
    }

    if (!plainDescription) {
      nextErrors.description = "Description is required.";
    } else if (plainDescription.length < 10) {
      nextErrors.description =
        "Description must be at least 10 characters long.";
    }

    if (!trimmedThumbnail) {
      nextErrors.thumbnailUrl = "Thumbnail image URL is required.";
    } else if (!isValidHttpUrl(trimmedThumbnail)) {
      nextErrors.thumbnailUrl =
        "Enter a valid image URL starting with http:// or https://.";
    }

    if (!trimmedLocation) {
      nextErrors.location = "Event location is required.";
    } else if (trimmedLocation.length < 3) {
      nextErrors.location = "Event location must be at least 3 characters.";
    }

    return nextErrors;
  }

  async function onSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (!user) {
      setErrors({ form: "Please log in to update this event." });
      return;
    }

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      type: eventType,
      date,
      description: description.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      location: location.trim(),
      numberOfVolunteers: numberOfVolunteers as number,
      organizerId: event.organizerId,
      organizerName: event.organizerName,
      organizerEmail: event.organizerEmail,
      organizerImage: event.organizerImage,
    };

    try {
      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured. Restart the dev server after updating .env.",
        );
      }

      const response = await fetch(
        `${API_URL}/events/${encodeURIComponent(event._id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(
          data?.message ??
            `The server responded with ${response.status} ${response.statusText}.`,
        );
      }

      toast.success("Event updated successfully!");
      router.push("/manageEvents");
      router.refresh();
    } catch (err) {
      console.error("Failed to update event", err);
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 rounded-2xl bg-[#fffdf7] p-5 ring-1 ring-[#e7ddc8] sm:p-7"
    >
      {errors.form && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700"
        >
          <i
            aria-hidden="true"
            className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"
          />
          <span>{errors.form}</span>
        </div>
      )}

      {!isPending && !user && (
        <div
          role="status"
          className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-[#e8d9b6] bg-[#fdf6e3] px-3.5 py-3 text-[13px] font-medium text-forest"
        >
          <i aria-hidden="true" className="fa-solid fa-circle-info shrink-0" />
          <span>Please log in to update an event.</span>
          <Link
            href="/log-in"
            className="font-bold text-clay underline underline-offset-4 transition-colors hover:text-[#b8480f]"
          >
            Log in
          </Link>
        </div>
      )}

      <div className="space-y-5">
        <Field
          id="event-title"
          label="Event Title"
          error={errors.title}
          errorId="event-title-error"
        >
          <input
            id="event-title"
            name="title"
            type="text"
            autoComplete="off"
            required
            maxLength={120}
            value={title}
            onChange={(inputEvent) => {
              setTitle(inputEvent.target.value);
              clearError("title");
            }}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "event-title-error" : undefined}
            placeholder="Enter event title"
            className={inputClass(errors.title)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            id="event-type"
            label="Event Type"
            error={errors.eventType}
            errorId="event-type-error"
          >
            <div className="relative">
              <i
                aria-hidden="true"
                className="fa-solid fa-leaf pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#4a8b3a]"
              />
              <select
                id="event-type"
                name="type"
                required
                value={eventType}
                onChange={(inputEvent) => {
                  setEventType(inputEvent.target.value);
                  clearError("eventType");
                }}
                aria-invalid={Boolean(errors.eventType)}
                aria-describedby={
                  errors.eventType ? "event-type-error" : undefined
                }
                className={`${inputClass(errors.eventType)} appearance-none pl-9 pr-9 ${
                  eventType ? "text-forest" : "text-forest/45"
                }`}
              >
                <option value="" disabled>
                  Select event type
                </option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <i
                aria-hidden="true"
                className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-forest/60"
              />
            </div>
          </Field>

          <Field
            id="event-date"
            label="Event Date"
            error={errors.date}
            errorId="event-date-error"
          >
            <div className="relative">
              <i
                aria-hidden="true"
                className="fa-solid fa-calendar-days pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-forest/70"
              />
              <input
                id="event-date"
                name="date"
                ref={dateInputRef}
                type="date"
                required
                value={date}
                onChange={(inputEvent) => {
                  setDate(inputEvent.target.value);
                  clearError("date");
                }}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? "event-date-error" : undefined}
                className={`${inputClass(errors.date)} pl-9`}
              />
            </div>
          </Field>

          <Field
            id="number-of-volantier"
            label="Number Of Volantier"
            error={errors.numberOfVolunteers}
            errorId="number-of-volantier-error"
          >
            <input
              id="number-of-volantier"
              name="numberOfVolunteers"
              type="number"
              autoComplete="off"
              required
              value={numberOfVolunteers}
              onChange={(inputEvent) => {
                const value = inputEvent.target.value;
                setNumberOfVolunteers(value === "" ? "" : Number(value));
                clearError("numberOfVolunteers");
              }}
              aria-invalid={Boolean(errors.numberOfVolunteers)}
              aria-describedby={
                errors.numberOfVolunteers
                  ? "number-of-volantier-error"
                  : undefined
              }
              placeholder="Set Volunteer Numbers"
              className={inputClass(errors.numberOfVolunteers)}
            />
          </Field>
        </div>

        <div>
          <label
            htmlFor="event-description"
            id="event-description-label"
            className="mb-1.5 flex items-center gap-1 text-[13px] font-bold text-forest"
          >
            Description
            <span aria-hidden="true" className="text-clay">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>

          <div
            className={`overflow-hidden rounded-lg border bg-white ${
              errors.description ? "border-red-400" : "border-[#ddd5c2]"
            } focus-within:ring-2 ${
              errors.description
                ? "focus-within:ring-red-500/15"
                : "focus-within:ring-forest/15"
            }`}
          >
            <div
              role="toolbar"
              aria-label="Text formatting"
              aria-controls="event-description"
              className="flex items-center gap-1 border-b border-[#eee6d5] px-2 py-1.5"
            >
              <ToolbarButton
                label="Bold"
                icon="fa-bold"
                onClick={() => runEditorCommand("bold")}
              />
              <ToolbarButton
                label="Italic"
                icon="fa-italic"
                onClick={() => runEditorCommand("italic")}
              />
              <ToolbarButton
                label="Underline"
                icon="fa-underline"
                onClick={() => runEditorCommand("underline")}
              />
              <ToolbarButton
                label="Bulleted list"
                icon="fa-list-ul"
                onClick={() => runEditorCommand("insertUnorderedList")}
              />
              <ToolbarButton
                label="Numbered list"
                icon="fa-list-ol"
                onClick={() => runEditorCommand("insertOrderedList")}
              />
              <ToolbarButton
                label="Insert link"
                icon="fa-link"
                onClick={insertLink}
              />
            </div>

            <div
              id="event-description"
              ref={editorRef}
              role="textbox"
              aria-multiline="true"
              aria-labelledby="event-description-label"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "event-description-error" : undefined
              }
              contentEditable
              suppressContentEditableWarning
              onInput={syncDescription}
              dangerouslySetInnerHTML={{ __html: event.description ?? "" }}
              data-placeholder="Describe the event, its goals, and what participants will do..."
              className="max-h-64 min-h-26 overflow-y-auto px-3 py-2.5 text-[13.5px] leading-6 text-forest outline-none empty:before:text-forest/45 empty:before:content-[attr(data-placeholder)]"
            />
          </div>

          {errors.description && (
            <p
              id="event-description-error"
              className="mt-1 text-xs font-medium text-red-600"
            >
              {errors.description}
            </p>
          )}
        </div>

        <Field
          id="thumbnail-url"
          label="Thumbnail Image URL"
          error={errors.thumbnailUrl}
          errorId="thumbnail-url-error"
        >
          <div className="relative">
            <i
              aria-hidden="true"
              className="fa-solid fa-link pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-forest/70"
            />
            <input
              id="thumbnail-url"
              name="thumbnailUrl"
              type="url"
              autoComplete="url"
              required
              maxLength={500}
              value={thumbnailUrl}
              onChange={(inputEvent) => {
                setThumbnailUrl(inputEvent.target.value);
                clearError("thumbnailUrl");
              }}
              aria-invalid={Boolean(errors.thumbnailUrl)}
              aria-describedby={
                errors.thumbnailUrl ? "thumbnail-url-error" : undefined
              }
              placeholder="https://example.com/image.jpg"
              className={`${inputClass(errors.thumbnailUrl)} pl-9`}
            />
          </div>
        </Field>

        <Field
          id="event-location"
          label="Location"
          error={errors.location}
          errorId="event-location-error"
        >
          <div className="relative">
            <i
              aria-hidden="true"
              className="fa-solid fa-location-dot pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-forest/70"
            />
            <input
              id="event-location"
              name="location"
              type="text"
              autoComplete="off"
              required
              maxLength={160}
              value={location}
              onChange={(inputEvent) => {
                setLocation(inputEvent.target.value);
                clearError("location");
              }}
              aria-invalid={Boolean(errors.location)}
              aria-describedby={
                errors.location ? "event-location-error" : undefined
              }
              placeholder="Enter event location (e.g., AIUB Campus, Dhaka)"
              className={`${inputClass(errors.location)} pl-9`}
            />
          </div>
        </Field>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/manageEvents")}
          className="h-10 rounded-lg border border-[#e2d9c6] bg-[#f7f1e1] px-6 text-[13.5px] font-bold text-forest transition-colors hover:bg-[#f0e8d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-clay px-6 text-[13.5px] font-bold text-white shadow-sm transition-colors hover:bg-[#c24714] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf7] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <i
                aria-hidden="true"
                className="fa-solid fa-spinner animate-spin"
              />
              Updating...
            </>
          ) : (
            <>
              <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
              Update Event
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  return `h-10 w-full rounded-lg border bg-white px-3 text-[13.5px] text-forest outline-none transition placeholder:text-forest/45 focus:ring-2 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : "border-[#ddd5c2] focus:border-forest focus:ring-forest/15"
  }`;
}

function Field({
  id,
  label,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1 text-[13px] font-bold text-forest"
      >
        {label}
        <span aria-hidden="true" className="text-clay">
          *
        </span>
        <span className="sr-only">(required)</span>
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-[12.5px] text-forest/75 transition-colors hover:bg-[#f3eddc] hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
    >
      <i aria-hidden="true" className={`fa-solid ${icon}`} />
    </button>
  );
}
