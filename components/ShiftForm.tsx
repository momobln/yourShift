"use client";
import { Guard } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

const SHIFT_TEMPLATES = {
  day: { start: "06:00", end: "18:00" },
  night: { start: "18:00", end: "06:00" },
} as const;

type SubmissionState = "idle" | "submitting";

type ShiftTemplateKey = keyof typeof SHIFT_TEMPLATES | "custom";

type ShiftFormProps = {
  onAdded?: () => void;
  initialShift?: {
    id: string;
    guardId: string;
    type: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  onCancelEdit?: () => void;
};

export default function ShiftForm({
  onAdded,
  initialShift = null,
  onCancelEdit,
}: ShiftFormProps) {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [guardId, setGuardId] = useState<string | null>(null);
const [templateKey, setTemplateKey] = useState<ShiftTemplateKey>("day");
  const [type, setType] = useState<string>("day");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState<string>(SHIFT_TEMPLATES.day.start);
  const [endTime, setEndTime] = useState<string>(SHIFT_TEMPLATES.day.end);
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isSubmitting = status === "submitting";
  const isEditing = Boolean(initialShift?.id);

  const guardOptions = useMemo(
    () =>
      guards.map((g) => ({
        value: g.id,
        label: g.name ?? g.email ?? "Unnamed Guard",
      })),
    [guards],
  );

   async function loadGuards() {
    try {
      const res = await fetch("/api/guards");
      if (!res.ok) {
        throw new Error("Failed to load guards");
      }
      const data = (await res.json()) as Guard[];
      setGuards(data);
    } catch (err) {
       setError("Unable to load guards. Please try again.");
    }
  }

  function applyTemplate(template: keyof typeof SHIFT_TEMPLATES) {
    const config = SHIFT_TEMPLATES[template];
    setTemplateKey(template);
    setType(template);
    setStartTime(config.start);
    setEndTime(config.end);
  }

  function resetForm(options: { clearMessage?: boolean } = {}) {
    const { clearMessage = true } = options;
    setGuardId(null);
    applyTemplate("day");
    setDate("");
    setError(null);
    if (clearMessage) {
      setMessage(null);
    }
  }

  useEffect(() => {
    loadGuards();
  }, []);

  useEffect(() => {
    if (initialShift) {
      setGuardId(initialShift.guardId);
      setType(initialShift.type);
      setDate(initialShift.date);
      setStartTime(initialShift.startTime);
      setEndTime(initialShift.endTime);
      if (initialShift.type === "day" || initialShift.type === "night") {
        setTemplateKey(initialShift.type);
      } else {
        setTemplateKey("custom");
      }
      setMessage(null);
      setError(null);
      return;
    }

    resetForm();
  }, [initialShift]);

  const handleTemplateChange = (value: ShiftTemplateKey) => {
    if (value === "custom") {
      setTemplateKey("custom");
      return;
    }

    applyTemplate(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!guardId) {
      setError("Please select a guard before saving the shift.");
      setMessage(null);
      return;
    }

    if (!date) {
      setError("Please choose a date for the shift.");
      setMessage(null);
      return;
    }

    if (!type.trim()) {
      setError("Please provide a shift label.");
      setMessage(null);
      return;
    }

    setStatus("submitting");
    setError(null);
    setMessage(null);

    const payload = {
      id: initialShift?.id,
      guardId,
      type,
      startTime,
      endTime,
      date,
    };

    try {
      const res = await fetch("/api/shifts", {
         method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const response = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(response?.error ?? "Unable to save the shift.");
      }

      setMessage(
        isEditing ? "Shift updated successfully." : "Shift added successfully.",
      );

      if (isEditing) {
        onCancelEdit?.();
      }

       onAdded?.();
      resetForm({ clearMessage: false });
    } catch (err) {
       setError(
         err instanceof Error
          ? err.message
          : "Unexpected error. Please try again.",
      );
    } finally {
      setStatus("idle");
    }
    };

  return (
     <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-3 rounded-md border p-4"
    >
      <h2 className="text-xl font-bold">
        {isEditing ? "Edit Shift" : "Add Shift"}
      </h2>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <select
       className="rounded border p-2"
        value={guardId ?? ""}
         onChange={(e) => setGuardId(e.target.value || null)}
      >
        <option value="">Select Guard</option>
          {guardOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
      className="rounded border p-2"
        value={templateKey}
        onChange={(e) =>
          handleTemplateChange(e.target.value as ShiftTemplateKey)
        }
      >
        <option value="day">Day Shift (06:00 - 18:00)</option>
        <option value="night">Night Shift (18:00 - 06:00)</option>
        <option value="custom">Custom</option>
      </select>

      <input
        className="rounded border p-2"
        placeholder="Shift label"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setTemplateKey("custom");
        }}
      />

      <input
        type="date"
        className="rounded border p-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Start Time
          <input
            type="time"
            className="rounded border p-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          End Time
          <input
            type="time"
            className="rounded border p-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-green-600 p-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Shift"
              : "Add Shift"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              onCancelEdit?.();
              resetForm();
            }}
            className="rounded bg-gray-200 p-2 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
