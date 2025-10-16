import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
    const guards = await prisma.guard.findMany();
    return NextResponse.json(guards);
}

export async function POST(req: Request) {
 const data = await req.json();
 if(!data.name || !data.email)
    return NextResponse.json({ error: "Missing fields"}, { status: 400});

 const guard = await prisma.guard.create({ data });
 return NextResponse.json(guard);
}
export async function DELETE(req: Request) {
    const { id } = await req.json();
    try {
        await prisma.guard.delete({ where: { id }});
        return NextResponse.json({ message: "Guard deleted successfully!"});
    } catch {
        return NextResponse.json({ error: "Guard not found"}, {status: 400});
    }
}

export async function PUT(req: Request) {
    const data = await req.json();
    if (!data.id)
        return NextResponse.json({ error: "Missing ID"}, { status: 400});

    const updated  = await prisma.guard.update({
        where: { id: data.id },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
        }
    });
return NextResponse.json(updated);
}