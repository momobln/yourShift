import GuardForm from "@/components/GuardForm";
import ShiftForm from "@/components/ShiftForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/lib/auth-options";
import prisma from "@/app/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const role = (user as { role?: string | null } | undefined)?.role ?? "GUARD";
  const displayName = user?.name ?? "Admin";

  // إذا لم يكن المستخدم مسجلاً الدخول
  if (!user) {
    redirect("/api/auth/signin");
  }


   if (role !== "ADMIN") {
    redirect("/guards");
  }

  const registeredGuards = await prisma.user.findMany({
    where: { role: "GUARD" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  //  واجهة الإدارة
  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard</h1>
       <p className="mb-10">Welcome, {displayName}</p>

      {/* إدارة الحراس */}
      <section className="border p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Add Guard</h2>
        <GuardForm />
      </section>

      {/* إدارة الورديات */}
      <section className="border p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Add Shift</h2>
        <ShiftForm />
      </section>

      {/* الحراس المسجلون */}
      <section className="border p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          Guards signed in
        </h2>
        {registeredGuards.length === 0 ? (
          <p className="text-sm text-gray-500">No guards have signed in yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {registeredGuards.map((guard) => (
                <tr key={guard.id} className="border-b">
                  <td className="border p-2">{guard.name ?? "Unnamed"}</td>
                  <td className="border p-2">{guard.email ?? "—"}</td>
                  <td className="border p-2">
                    {guard.createdAt.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}