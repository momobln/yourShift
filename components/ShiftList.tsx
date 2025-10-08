"use client";

import { useEffect, useState } from "react";
import type { Guard } from "@prisma/client";

interface ShiftListProps {
  refreshKey?: number;
}

type ShiftResponse = {
  id: number;
  type: string;
  startTime: string;
  endTime: string;
  date: string;
  guard?: Guard | null;
};

export default function ShiftList({ refreshKey = 0 }: ShiftListProps) {
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadShifts() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/shifts");
        if (!res.ok) {
          throw new Error("Failed to load shifts");
        }
        const data: ShiftResponse[] = await res.json();
        if (isMounted) {
          setShifts(data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Unable to load shifts. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadShifts();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(date);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading shifts…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (shifts.length === 0) {
    return <p className="text-sm text-gray-500">No shifts scheduled yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {shifts.map((shift) => (
        <li
          key={shift.id}
          className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">
              {shift.guard?.name ?? "Unassigned guard"}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(shift.date)} · {shift.type === "day" ? "Day" : "Night"} shift
            </p>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {shift.startTime} → {shift.endTime}
          </div>
        </li>
      ))}
    </ul>
  );
}
