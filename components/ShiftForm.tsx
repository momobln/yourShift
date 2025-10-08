"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Guard } from "@prisma/client";

interface ShiftFormProps {
  onShiftCreated?: () => void;
}

type Feedback = {
  status: "success" | "error";
  message: string;
};

export default function ShiftForm({ onShiftCreated }: ShiftFormProps) {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [guardId, setGuardId] = useState<number | null>(null);
  const [type, setType] = useState<"day" | "night">("day");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const shiftTimes = useMemo(
    () =>
      type === "day"
        ? { startTime: "06:00", endTime: "18:00" }
        : { startTime: "18:00", endTime: "06:00" },
    [type]
  );

  const loadGuards = useCallback(async () => {
    try {
      const res = await fetch("/api/guards");
      if (!res.ok) {
        throw new Error("Failed to load guards");
      }
      const data: Guard[] = await res.json();
      setGuards(data);
    } catch (error) {
      console.error(error);
      setFeedback({
        status: "error",
        message: "Unable to load guards. Please refresh the page.",
      });
    }
  }, []);

  useEffect(() => {
    loadGuards();
  }, [loadGuards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (guardId == null) {
      setFeedback({ status: "error", message: "Please select a guard." });
      return;
    }
    if (!date) {
      setFeedback({ status: "error", message: "Please choose a date." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ...shiftTimes,
          date,
          guardId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create shift");
      }

      setFeedback({
        status: "success",
        message: "Shift added successfully!",
      });
      setGuardId(null);
      setType("day");
      setDate("");
      onShiftCreated?.();
    } catch (error) {
      console.error(error);
      setFeedback({
        status: "error",
        message: "Unable to save the shift. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-md border p-4"
    >
      <h2 className="text-xl font-bold">Add Shift</h2>

      <select
        className="rounded border p-2"
        value={guardId ?? ""}
        onChange={(e) =>
          setGuardId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Select Guard</option>
        {guards.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <select
        className="rounded border p-2"
        value={type}
        onChange={(e) => setType(e.target.value as "day" | "night")}
      >
        <option value="day">Day Shift (06:00 - 18:00)</option>
        <option value="night">Night Shift (18:00 - 06:00)</option>
      </select>

      <input
        type="date"
        className="rounded border p-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button
        type="submit"
        className="rounded bg-green-600 p-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Add Shift"}
      </button>

      {feedback && (
        <p
          className={`text-sm ${
            feedback.status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
