import GuardForm from "@/components/GuardForm";
import ShiftForm from "@/components/ShiftForm";

export default function DashboardPage() {
    return (
        <main className="p-8 space-y-10">
            <h1 className="text-3xl font-bold mb-6"> Guards and Shifts Manegmant</h1>

            {/* Guards */}
            <section className="border p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-blue-600"> Add Guard!</h2>
                <GuardForm />
                
              </section>

              {/* Shifts */}
              <section className="border p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-blue-600"> Add Shift!</h2>
                <ShiftForm />
              </section>
        </main>
    );
}