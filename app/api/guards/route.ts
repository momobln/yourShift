import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/lib/auth-options";
import prisma from "@/app/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string | null }).role ?? "GUARD";

  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function GET() {
    const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  const guards = await prisma.guard.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(guards);
}

export async function POST(req: Request) {
    const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  const data = await req.json();

  if (!data.name || !data.email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

   const guard = await prisma.guard.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
  });

  return NextResponse.json(guard, { status: 201 });
}

export async function DELETE(req: Request) {
    const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };

  if (!id) {
    return NextResponse.json({ error: "Missing guard id" }, { status: 400 });
  }

  try {
    await prisma.guard.delete({ where: { id } });
    return NextResponse.json({ message: "Guard deleted successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Guard not found" }, { status: 404 });
  }
}

export async function PUT(req: Request) {
    const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  const data = (await req.json().catch(() => null)) as
    | {
        id?: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
      }
    | null;

  if (!data?.id) {
    return NextResponse.json({ error: "Missing guard id" }, { status: 400 });
  }

  const updated = await prisma.guard.update({
    where: { id: data.id },
    data: {
      name: data.name ?? undefined,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
    },
  });

  return NextResponse.json(updated);
}