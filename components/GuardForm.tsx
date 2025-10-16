"use client";
import { Guard } from "@prisma/client";
import { useState, useEffect } from "react";

export default function GuardForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [guards, setGuards] = useState<Guard[]>([]);

  async function loadGuards() {
    const res = await fetch("/api/guards");
    const data = await res.json();
    setGuards(data);
  }

  useEffect(() => {
    loadGuards();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = id ? "PUT" : "POST";
    const body = id ? { id, name, email, phone } : { name, email, phone };

    const res = await fetch("/api/guards", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert(id ? " Guard updated" : " Guard added");
      setName("");
      setEmail("");
      setPhone("");
      setId(null);
      loadGuards();
    }
  };

  const deleteGuard = async (id: string) => {
    await fetch("/api/guards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadGuards();
  };

  const editGuard = (g: Guard) => {
    setId(g.id);
    setName(g.name ?? "");
    setEmail(g.email ?? "");
    setPhone(g.phone ?? "");
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border p-4 rounded-md"
      >
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {id ? "Update Guard" : "Add Guard"}
        </button>
      </form>

      <ul className="border-t pt-2">
        {guards.map((g) => (
          <li key={g.id} className="flex justify-between py-2 border-b">
            <span>
              {g.name} — {g.email} — {g.phone}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => editGuard(g)}
                className="bg-yellow-400 text-black px-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteGuard(g.id)}
                className="bg-red-500 text-white px-2 rounded"
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
