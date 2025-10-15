import GuardForm from "@/components/GuardForm";
import ShiftForm from "@/components/ShiftForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";



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
export default async function DAshboardPage () {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect ("/api/auth/signin");
  }

  if (user.role !== "ADMIN") {
    redirect ("/guard");
  }
  return ( 
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-16">ADMIN §</h1>
      <p>welcome, {user.name}</p>
    </main>
  )
}