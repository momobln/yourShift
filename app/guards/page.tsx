import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth-options";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function GuardShiftsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const role = (session.user as { role?: string | null } | undefined)?.role ?? "GUARD";

  if (role === "ADMIN") {
    redirect("/dashboard");
  }

  const guardProfile = await prisma.guard.findFirst({
    where: { user: { email: session.user?.email ?? undefined } },
  });

  const allShifts = guardProfile
    ? await prisma.shift.findMany({
        include: { guard: true },
        orderBy: { date: "asc" },
      })
    : [];

  const myShifts = guardProfile
    ? allShifts.filter((shift) => shift.guardId === guardProfile.id)
    : [];

  const teamShifts = guardProfile
    ? allShifts.filter((shift) => shift.guardId !== guardProfile.id)
    : [];

  return (
     <main className="space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-bold text-blue-700">My Schedule</h1>
        <p className="text-gray-600">
          Review your assigned shifts and stay aware of the broader security
          coverage.
        </p>
      </header>

      {!guardProfile ? (
        <section className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
          <h2 className="text-lg font-semibold text-yellow-800">Profile pending</h2>
          <p className="text-sm text-yellow-800">
            We could not match your login with a guard profile yet. Please
            contact your administrator so they can link your account.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-green-700">Your Shifts</h2>
          {myShifts.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              You have no scheduled shifts yet. Check back soon.
            </p>
          ) : (
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Start</th>
                  <th className="border p-2">End</th>
                </tr>
              </thead>
              <tbody>
                {myShifts.map((shift) => (
                  <tr key={shift.id} className="border-b">
                    <td className="border p-2">{formatDate(shift.date)}</td>
                    <td className="border p-2 capitalize">{shift.type}</td>
                    <td className="border p-2">{shift.startTime}</td>
                    <td className="border p-2">{shift.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {guardProfile && (
        <section className="rounded-lg border p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-700">Team Coverage</h2>
          {teamShifts.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              No other shifts scheduled yet.
            </p>
          ) : (
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border p-2">Guard</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Start</th>
                  <th className="border p-2">End</th>
                </tr>
              </thead>
              <tbody>
                {teamShifts.map((shift) => (
                  <tr key={shift.id} className="border-b">
                    <td className="border p-2">{shift.guard?.name ?? "Unassigned"}</td>
                    <td className="border p-2">{formatDate(shift.date)}</td>
                    <td className="border p-2 capitalize">{shift.type}</td>
                    <td className="border p-2">{shift.startTime}</td>
                    <td className="border p-2">{shift.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  );
}