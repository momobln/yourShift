import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
    const shifts = await prisma.shift.findMany({
        include: { guard: true},
    });
    return NextResponse.json(shifts);
}

export async function POST(req: Request){
    const data = await req.json();

    if (!data.type || !data.startTime || !data.endTime || !data.date || !data.guardId) {
return NextResponse.json({ error: "Missing required fields" }, { status: 400});
    }
    const newShift = await prisma.shift.create({
        data: {
            type: data.type,
            startTime: data.startTime,
            endTime: data.endTime,
            data: new Date(data.date),
            guardId: data.guardId,
        
        },

    });
    return NextResponse.json(newShift);
    
}
