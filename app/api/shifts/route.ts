import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth-options";

type CreateShiftPayload = {
  type: string;
  startTime: string;
  endTime: string;
  date: string;
  guardId: string;
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string | null }).role ?? "GUARD";
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");

  if (role === "ADMIN") {
    const shifts = await prisma.shift.findMany({
      include: { guard: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(shifts);
  }

  const guard = await prisma.guard.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!guard) {
    return NextResponse.json(
      { error: "Guard profile not found. Please contact your administrator." },
      { status: 404 }
    );
  }

  const includeAll = scope === "team";

  const shifts = await prisma.shift.findMany({
    where: includeAll ? {} : { guardId: guard.id },
    include: { guard: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(shifts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string | null }).role ?? "GUARD";
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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