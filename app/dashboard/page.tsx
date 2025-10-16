import GuardForm from "@/components/GuardForm";
import ShiftForm from "@/components/ShiftForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // إذا لم يكن المستخدم مسجلاً الدخول
  if (!user) {
    redirect("/api/auth/signin");
  }

  // إذا لم يكن المستخدم ADMIN نعيد توجيهه لصفحة الحراس
  if (user.role !== "ADMIN") {
    redirect("/guards");
  }

  //  واجهة الإدارة
  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard</h1>
      <p className="mb-10">Welcome, {user.name}</p>

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
    </main>
  );
}
