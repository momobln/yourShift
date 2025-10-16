"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-400">
        YourShift
      </Link>

      <div className="flex gap-4">
        {user?.role === "ADMIN" && <Link href="/dashboard">Dashboard</Link>}
        <Link href="/guards">My Shifts</Link>
        <Link href="/shifts">All Shifts</Link>
      </div>

      {user ? (
        <button
          onClick={() => signOut()}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      ) : (
        <Link href="/api/auth/signin" className="bg-blue-600 px-4 py-2 rounded-lg">
          Sign In
        </Link>
      )}
    </nav>
  );}