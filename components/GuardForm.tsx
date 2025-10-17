"use client";
import { Guard } from "@prisma/client";
import { useState, useEffect } from "react";

type SubmissionState = "idle" | "loading";

export default function GuardForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isSubmitting = status === "loading";

  async function loadGuards() {
      try {
      const res = await fetch("/api/guards");
      setMessage(null);
      if (!res.ok) {
        throw new Error("Unable to fetch guards");
      }
      const data = (await res.json()) as Guard[];
      setGuards(data);
    } catch (err) {
      setError("Failed to load guards. Please refresh the page.");
    }
  }

  useEffect(() => {
    loadGuards();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setMessage(null);
      setError("Name and email are required.");
      return;
    }

    setStatus("loading");
    setError(null);
    setMessage(null);

    const method = id ? "PUT" : "POST";
    const body = id ? { id, name, email, phone } : { name, email, phone };

    try {
      const res = await fetch("/api/guards", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to save guard");
      }

      setMessage(
        id ? "Guard updated successfully." : "Guard added successfully.",
      );
      setName("");
      setEmail("");
      setPhone("");
      setId(null);
      loadGuards();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred.",
      );
    } finally {
      setStatus("idle");
    }
  };

  const deleteGuard = async (guardId: string) => {
    try {
      const res = await fetch("/api/guards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guardId }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to delete guard");
      }

      setMessage("Guard deleted successfully.");
      loadGuards();
    } catch (err) {
       setError(err instanceof Error ? err.message : "Failed to delete guard.");
    }
  };

  const editGuard = (g: Guard) => {
    setError(null);
    setId(g.id);
    setName(g.name ?? "");
    setEmail(g.email ?? "");
    setPhone(g.phone ?? "");
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
         className="flex flex-col gap-2 rounded-md border p-4"
      >
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <input
        className="rounded border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
        className="rounded border p-2"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : id ? "Update Guard" : "Add Guard"}
        </button>
      </form>

      <ul className="border-t pt-2">
        {guards.map((g) => (
           <li key={g.id} className="flex justify-between border-b py-2">
            <span>
              {g.name} — {g.email} — {g.phone ?? "—"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => editGuard(g)}
                className="rounded bg-yellow-400 px-2 text-black"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteGuard(g.id)}
                className="rounded bg-red-500 px-2 text-white"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
