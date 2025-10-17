import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import AdminShiftManager from "@/components/AdminShiftManager";
import GuardShiftOverview from "@/components/GuardShiftOverview";
import { authOptions } from "@/app/lib/auth-options";

export default async function ShiftsPage() {
  const session = await getServerSession(authOptions);

   if (!session?.user) {
    redirect("/api/auth/signin");
  }

   const role = (session.user as { role?: string | null }).role ?? "GUARD";

  return (
     <main className="space-y-8 p-8">
      {role === "ADMIN" ? (
        <section className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-blue-700">
              Shift Management
            </h1>
            <p className="text-sm text-gray-600">
              Create, update, and review every guard shift from a single place.
            </p>
          </header>

          <AdminShiftManager />
        </section>
      ) : (
        <GuardShiftOverview />
      )}
    </main>
  );
}