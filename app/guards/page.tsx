import GuardForm from "@/components/GuardForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default function GuardsPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if(!user) {
        redirect ("/api/auth/signin");
    }

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p>Here you can view your shifts and request swaps.</p>
            

        </main>
    )
}

