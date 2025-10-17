"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as { role?: string | null } | undefined)?.role ?? "GUARD";

  return (
     <nav className="flex items-center justify-between bg-gray-900 px-6 py-4 text-white">
      <Link href="/" className="text-xl font-bold text-blue-400">
        YourShift
      </Link>

      <div className="flex gap-4">
        {role === "ADMIN" && <Link href="/dashboard">Dashboard</Link>}
        <Link href="/guards">My Shifts</Link>
        <Link href="/shifts">Shifts</Link>
      </div>

      {user ? (
        <button
          onClick={() => signOut()}
          className="rounded-lg bg-red-500 px-4 py-2 hover:bg-red-600"
        >
          Sign Out
        </button>
      ) : (
        <Link href="/api/auth/signin" className="rounded-lg bg-blue-600 px-4 py-2">
          Sign In
        </Link>
        )}
    </nav>
    );
}