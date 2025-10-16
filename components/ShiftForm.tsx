"use client";
import { Guard } from "@prisma/client";
import { useEffect, useState } from "react";

type SubmissionState = "idle" | "submitting";

const SHIFT_TEMPLATES = {
  day: { start: "06:00", end: "18:00" },
  night: { start: "18:00", end: "06:00" },
} as const;

export default function ShiftForm({ onAdded }: { onAdded?: () => void }) {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [guardId, setGuardId] = useState<string | null>(null);
   const [type, setType] = useState<keyof typeof SHIFT_TEMPLATES>("day");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const isSubmitting = status === "submitting";

  async function loadGuards() {
     try {
      const res = await fetch("/api/guards");
      if (!res.ok) {
        throw new Error("Failed to load guards");
      }
      const data = (await res.json()) as Guard[];
      setGuards(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load guards. Please try again.");
    }
  }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
     if (!guardId) {
      setError("Please select a guard before creating a shift.");
      return;
    }

    if (!date) {
      setError("Please choose a date for the shift.");
      return;
    }

    setStatus("submitting");
    setError(null);

    const schedule = SHIFT_TEMPLATES[type];

    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          startTime: schedule.start,
          endTime: schedule.end,
          date,
          guardId,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Unable to add the shift.");
      }

      alert("Shift added successfully!");
      setDate("");
      setGuardId(null);
      setType("day");
       onAdded?.();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unexpected error. Please try again."
      );
    } finally {
      setStatus("idle");
    }
  }

  useEffect(() => {
    loadGuards();
  }, []);

  return (
     <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-3 rounded-md border p-4"
    >
      <h2 className="text-xl font-bold">Add Shift</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <select
        className="border p-2 rounded"
        value={guardId ?? ""}
        onChange={(e) => setGuardId(e.target.value)}
      >
        <option value="">Select Guard</option>
        {guards.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 rounded"
        value={type}
         onChange={(e) => setType(e.target.value as keyof typeof SHIFT_TEMPLATES)}
      >
        <option value="day">Day Shift (06:00 - 18:00)</option>
        <option value="night">Night Shift (18:00 - 06:00)</option>
      </select>

      <input
        type="date"
        className="border p-2 rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-green-600 p-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Add Shift"}
      </button>
    </form>
  );
}
