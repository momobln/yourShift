import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

type CreateShiftPayload ={
    type:       string;
    startTime:  string;
    endTime:    string; 
    date: string;
    guardId: string;
};

export async function GET() {
    const shifts = await prisma.shift.findMany({
    include: { guard: true },
  });
  return NextResponse.json(shifts);
}

export async function POST(req: Request) {
  const payload = (await req.json()) as Partial<CreateShiftPayload>;

  if (!payload.type || !payload.startTime || !payload.endTime || !payload.date || !payload.guardId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newShift = await prisma.shift.create({
    data: {
      type: payload.type,
      startTime: payload.startTime,
      endTime: payload.endTime,
      date: new Date(payload.date),
      guardId: payload.guardId,
    },
    include: { guard: true },
  });
  return NextResponse.json(newShift);
}