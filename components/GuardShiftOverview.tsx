"use client";

import { useEffect, useState } from "react";

type ShiftRow = {
  id: string;
  guardName: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GuardShiftOverview() {
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/shifts?scope=team");
      if (!res.ok) {
        throw new Error("Failed to load shifts");
      }
      const data = (await res.json()) as {
        id: string;
        guard?: { name?: string | null } | null;
        type: string;
        date: string;
        startTime: string;
        endTime: string;
      }[];
      const formatted = data.map<ShiftRow>((shift) => ({
        id: shift.id,
        guardName: shift.guard?.name ?? "Unassigned",
        type: shift.type,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
      }));
      setShifts(formatted);
    } catch (err) {
      setError("Unable to load shifts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-blue-700">
          Team Shifts Overview
        </h1>
        <p className="text-sm text-gray-600">
          Stay informed about every guard&apos;s assignment so you can
          coordinate efficiently.
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-lg border p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Loading shifts...</p>
        ) : shifts.length === 0 ? (
          <p className="text-sm text-gray-500">No shifts scheduled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border p-2">Guard</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Start</th>
                  <th className="border p-2">End</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b hover:bg-gray-50">
                    <td className="border p-2">{shift.guardName}</td>
                    <td className="border p-2 capitalize">{shift.type}</td>
                    <td className="border p-2">{formatDate(shift.date)}</td>
                    <td className="border p-2">{shift.startTime}</td>
                    <td className="border p-2">{shift.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}