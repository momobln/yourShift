import GuardForm from "@/components/GuardForm";
import ShiftManagement from "@/components/ShiftManagement";

export default function DashboardPage() {
  return (
    <main className="space-y-10 p-8">
      <h1 className="mb-6 text-3xl font-bold">Guards and Shifts Management</h1>

      <section className="rounded-lg border p-4 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-blue-600">
          Add Guard
        </h2>
        <GuardForm />
      </section>

      <section className="rounded-lg border p-4 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-blue-600">
          Manage Shifts
        </h2>
        <ShiftManagement />
      </section>
    </main>
  );
}
