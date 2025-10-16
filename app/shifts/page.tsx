"use client";
import { useEffect, useState } from "react";
import ShiftForm from "@/components/ShiftForm";

type GuardSummary = {
  name?: string | null;
};

type Shift = {
  id: string;
  guard?: GuardSummary | null;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  async function loadShifts() {
    const res = await fetch("/api/shifts");
    const data = await res.json();
    setShifts(data);
  }

  useEffect(() => {
    loadShifts();
  }, []);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Shifts Management</h1>

      {/*  مرر الدالة كمُعطى للمكوّن */}
      <ShiftForm onAdded={loadShifts} />

      <section className="border p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">All Shifts</h2>

        {shifts.length === 0 ? (
          <p className="text-gray-500">No shifts yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="border p-2 text-left">Guard</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Start</th>
                <th className="border p-2 text-left">End</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="border p-2">{s.guard?.name ?? "—"}</td>
                  <td className="border p-2">{s.type}</td>
                  <td className="border p-2">
                    {new Date(s.date).toLocaleDateString()}
                  </td>
                  <td className="border p-2">{s.startTime}</td>
                  <td className="border p-2">{s.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
