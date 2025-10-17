"use client";
import { Guard } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";

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
   const [guardMode, setGuardMode] = useState<"select" | "create">("select");
  const [newGuardName, setNewGuardName] = useState("");
  const [newGuardEmail, setNewGuardEmail] = useState("");
  const [newGuardPhone, setNewGuardPhone] = useState("");
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

  const loadGuards = useCallback(async () => {
    try {
      const res = await fetch("/api/guards");
      if (!res.ok) {
        throw new Error("Failed to load guards");
      }
      const data = (await res.json()) as Guard[];
      setGuards(data);
      } catch (_err) {
      setError("Unable to load guards. Please try again.");
    }
     }, []);

     const applyTemplate = useCallback((template: keyof typeof SHIFT_TEMPLATES) => {
    const config = SHIFT_TEMPLATES[template];
    setTemplateKey(template);
    setType(template);
    setStartTime(config.start);
    setEndTime(config.end);
    }, []);

    const resetForm = useCallback(
    (options: { clearMessage?: boolean } = {}) => {
      const { clearMessage = true } = options;
      setGuardId(null);
      setGuardMode("select");
      setNewGuardName("");
      setNewGuardEmail("");
      setNewGuardPhone("");
      applyTemplate("day");
      setDate("");
      setError(null);
      if (clearMessage) {
        setMessage(null);
      }
    },
    [applyTemplate],
  );

  useEffect(() => {
    loadGuards();
    }, [loadGuards]);

  useEffect(() => {
    if (initialShift) {
      setGuardId(initialShift.guardId);
      setGuardMode("select");
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
    }, [initialShift, resetForm]);

  const handleTemplateChange = (value: ShiftTemplateKey) => {
    if (value === "custom") {
      setTemplateKey("custom");
      return;
    }

    applyTemplate(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    let guardToAssign = guardId;

    if (guardMode === "select") {
      if (!guardToAssign) {
        setError("Please select a guard before saving the shift.");
        setMessage(null);
        setStatus("idle");
        return;
      }
    } else {
      if (!newGuardName.trim() || !newGuardEmail.trim()) {
        setError("Name and email are required to create a new guard.");
        setMessage(null);
        setStatus("idle");
        return;
      }

      try {
        const guardResponse = await fetch("/api/guards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newGuardName.trim(),
            email: newGuardEmail.trim(),
            phone: newGuardPhone.trim() || undefined,
          }),
        });

        if (!guardResponse.ok) {
          const guardPayload = (await guardResponse.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(guardPayload?.error ?? "Unable to create guard.");
        }

        const guardData = (await guardResponse.json()) as Guard;
        guardToAssign = guardData.id;
        setGuardId(guardData.id);
        await loadGuards();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unexpected error while creating the guard.",
        );
        setStatus("idle");
        return;
      }
    }

    const payload = {
      id: initialShift?.id,
       guardId: guardToAssign,
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

      <div className="space-y-3 rounded border p-3">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Guard</span>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="guardMode"
                value="select"
                checked={guardMode === "select"}
                onChange={() => setGuardMode("select")}
              />
              Select existing
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="guardMode"
                value="create"
                checked={guardMode === "create"}
                onChange={() => setGuardMode("create")}
              />
              Create new
            </label>
          </div>
        </div>

        {guardMode === "select" ? (
          <select
            className="w-full rounded border p-2"
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
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              className="rounded border p-2"
              placeholder="Guard name"
              value={newGuardName}
              onChange={(e) => setNewGuardName(e.target.value)}
            />
            <input
              className="rounded border p-2"
              placeholder="Guard email"
              value={newGuardEmail}
              onChange={(e) => setNewGuardEmail(e.target.value)}
            />
            <input
              className="rounded border p-2"
              placeholder="Phone (optional)"
              value={newGuardPhone}
              onChange={(e) => setNewGuardPhone(e.target.value)}
            />
          </div>
        )}
      </div>

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
        