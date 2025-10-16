import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth-options";
import { redirect } from "next/navigation";
import ShiftForm from "@/components/ShiftForm";

export default async function ShiftsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Shifts Management</h1>
      <ShiftForm />
    </main>
  );
}
