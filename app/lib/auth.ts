import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
    return await getServerSession(authOptions);
}


export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return null;
    }
    return session.user;
}