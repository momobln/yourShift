"use client";

import { useEffect, useMemo, useState } from "react";

import ShiftForm from "./ShiftForm";

type ApiShift = {
  id: string;
  guardId: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  guard?: {
    name?: string | null;
  } | null;
};

type ShiftRecord = {
  id: string;
  guardId: string;
  guardName: string;
  type: string;
  dateISO: string;
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

export default function AdminShiftManager() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [editingShift, setEditingShift] = useState<ShiftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const hasShifts = shifts.length > 0;

  const initialShiftPayload = useMemo(() => {
    if (!editingShift) {
      return null;
    }

    return {
      id: editingShift.id,
      guardId: editingShift.guardId,
      type: editingShift.type,
      date: editingShift.dateISO.slice(0, 10),
      startTime: editingShift.startTime,
      endTime: editingShift.endTime,
    } as const;
  }, [editingShift]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/shifts");
      if (!res.ok) {
        throw new Error("Failed to load shifts");
      }
      const data = (await res.json()) as ApiShift[];
      const normalized = data.map<ShiftRecord>((shift) => ({
        id: shift.id,
        guardId: shift.guardId,
        guardName: shift.guard?.name ?? "Unassigned",
        type: shift.type,
        dateISO: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
      }));
      setShifts(normalized);
    } catch (err) {
      setError("Unable to fetch shifts. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shiftId: string) => {
    try {
      setPendingDeleteId(shiftId);
      setActionError(null);
      setFeedback(null);

      const res = await fetch("/api/shifts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: shiftId }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to delete shift");
      }

      setFeedback("Shift deleted successfully.");
      if (editingShift?.id === shiftId) {
        setEditingShift(null);
      }
      await loadShifts();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete the shift.",
      );
    } finally {
      setPendingDeleteId(null);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  return (
    <section className="space-y-6">
      <ShiftForm
        onAdded={() => {
          setFeedback(null);
          setEditingShift(null);
          loadShifts();
        }}
        initialShift={initialShiftPayload}
        onCancelEdit={() => setEditingShift(null)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {actionError && <p className="text-sm text-red-600">{actionError}</p>}
      {feedback && <p className="text-sm text-green-600">{feedback}</p>}

      <div className="rounded-lg border p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Shifts</h2>
          {editingShift ? (
            <span className="text-sm text-blue-600">
              Editing shift for {editingShift.guardName}
            </span>
          ) : null}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading shifts...</p>
        ) : !hasShifts ? (
          <p className="text-sm text-gray-500">No shifts yet.</p>
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
                  <th className="border p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b hover:bg-gray-50">
                    <td className="border p-2">{shift.guardName}</td>
                    <td className="border p-2 capitalize">{shift.type}</td>
                    <td className="border p-2">{formatDate(shift.dateISO)}</td>
                    <td className="border p-2">{shift.startTime}</td>
                    <td className="border p-2">{shift.endTime}</td>
                    <td className="border p-2">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback(null);
                            setActionError(null);
                            setEditingShift(shift);
                          }}
                          className="rounded bg-yellow-400 px-2 py-1 text-xs font-medium text-black hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(shift.id)}
                          disabled={pendingDeleteId === shift.id}
                          className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {pendingDeleteId === shift.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
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