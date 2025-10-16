"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-8">
      {/* شعار التطبيق */}
      <h1 className="text-4xl font-bold text-blue-600 mb-4">YourShift</h1>
      <p className="text-gray-700 mb-8 max-w-xl">
        A smart management platform for security companies and guards. <br />
        Schedule shifts, manage attendance, and streamline your team's workflow — all in one place.
      </p>

      {/* عرض مختلف حسب حالة تسجيل الدخول */}
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">Welcome back, {user.name}!</p>
          {user.role === "ADMIN" ? (
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/guards"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              View My Shifts
            </Link>
          )}
        </div>
      ) : (
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Sign In to Continue
        </button>
      )}

      {/* قسم تعريفي بسيط */}
      <div className="mt-12 grid gap-6 md:grid-cols-3 text-left max-w-4xl">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">
             Easy Scheduling
          </h3>
          <p className="text-gray-600">
            Create and manage guard shifts with just a few clicks.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">
             Attendance Tracking
          </h3>
          <p className="text-gray-600">
            Guards can clock in/out and report incidents directly from the app.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">
             Internal Communication
          </h3>
          <p className="text-gray-600">
            Streamlined communication between HQ and on-site teams.
          </p>
        </div>
      </div>
    </main>
  );
}
