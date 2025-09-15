import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

// GET all events with products
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
  }

  const events = await prisma.event.findMany({
    include: { products: { include: { product: true } } },
  });
  return NextResponse.json(events);
}

// CREATE event
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
  }

  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      name: body.name,
    },
  });
  return NextResponse.json(event);
}

// UPDATE event
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
  }

  const body = await req.json();
  const updatedEvent = await prisma.event.update({
    where: { id: body.id },
    data: { name: body.name },
  });

  return NextResponse.json(updatedEvent);
}

// DELETE event
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000"));
  }

  const body = await req.json();
  await prisma.event.delete({
    where: { id: body.id },
  });

  return NextResponse.json({ message: "Deleted successfully" });
}
