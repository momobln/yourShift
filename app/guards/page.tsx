/*import GuardForm from "@/components/GuardForm";

type Guard = {
    id: number;
    name: string;
    email: string;
    phone?: string;
};

export default async function GuarsPage() {
    const res = await fetch ("http://localhost:3001/api/guards", { cache: "no-store"});
    const guards = await res.json();


    return (
        <main className="p-8">
        <h1 className="text-2xl font-bod mb-4">
        <GuardForm/>
        <ul className="mt-4">
         {guards.map((g: Guard) => (
            <li key={g.id} className="border-b py-2 felx justify-between items-center">
            <div>
                {g.name} - {g.email} - {g.phone}

            </div>
            <form action={async () => {        //نستخدم “Server Action” مباشرة داخل الصفحة لحذف من السيرفر بدون API خارجي.
                "use server";
                await fetch("http://localhost3001/api/guards", {   //يرسل طلب حذف إلى /api/guards.
                    method: "DELETE", 
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: g.id}),             //يرسل رقم الحارس المطلوب حذفه.
                });
            }}>
                <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"> 
                    Delete
                </button>
            </form>

            </li>
         ))}
        
        </ul>
        </h1>
        </main>
    );
}*/
import GuardForm from "@/components/GuardForm";

export default function GuardsPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Guards Management</h1>
      <GuardForm />
    </main>
  );
}
