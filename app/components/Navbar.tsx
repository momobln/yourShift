"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
		<nav className="flex justify-between items-center px-8 py-4 bg-gray-800 text-white shadow-md">
			<div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-300">
					YourShift
				</Link>
        <Link href="/dashboard" className="hover:text-blue-300">Dashboard</Link>
        <Link href="/guards" className="hover:text-blue-300">Guards</Link>
        <Link href="/shifts" className="hover:text-blue-300">Shifts</Link>
			</div>

			<div>
				{session ? (
					<button
						onClick={() => signOut()}
						className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white"
					>
						Sign Out
					</button>
				) : (
					<button
						onClick={signIn}
						className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
					>
						Sign In
					</button>
				)}
			</div>
		</nav>
  );
}
