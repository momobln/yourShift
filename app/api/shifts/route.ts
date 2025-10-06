import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//GET all Shifts
export async function GET(){
    const shifts = await prisma.shift.findMany({
        include: { guard: true },
    });
    return NextResponse.json(shifts);
}

//create new Shift
export async function POST(req: Request){
    const data = await req.json();
    const newShift = await prisma.shift.create({
        data: {
            type: data.type,
            startTime: data.startTime,
            endTime: data.endTime,
            date: new Date(data.date),
            guardId: data.guardId,
        },
    });
    return NextResponse.json(newShift);
}