"use client";
import { Guard } from "@prisma/client";
import { useEffect, useState } from "react";

export default function ShiftForm() {
    const [guards, setGuards] = useState<Guard[]>([]);
    const [guardId, setGuardId] = useState<number | null>(null);
    const [type, setType] = useState("day");
    const [date, setDate] = useState("");

    async function loadGuards() {
        const res = await fetch ("/api/guards");
        const data = await res.json();
        setGuards(data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch("/api/shifts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type, 
                startTime: type === "day" ? "06:00" : "18:00",
                endTime: type === "night" ? "18:00" : "06:00", 
                date,
                guardId,
            }),
        });
        if (res.ok) alert("Shift added successfully!");
    }

    useEffect(() => {
        loadGuards();
    }, []);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border p-4 rounded-md mt-4">
            <h2 className="text-x1 font-bold">Add Shift</h2>

            <select 
            className="border p-2 rounded"
            value={guardId ?? ""}
            onChange={(e) => setGuardId(Number(e.target.value))}
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
            onChange={(e) => setType(e.target.value)}
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

            <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                Add Shift
            </button>

        </form>
    );

}